import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramAutomationTriggerLogEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-trigger-log.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';
import {
  InstagramFollowUpDmJob,
  type InstagramFollowUpDmJobData,
} from 'src/modules/instagram-webhooks/jobs/instagram-follow-up-dm.job';
import { type InstagramWebhookCommentValue } from 'src/modules/instagram-webhooks/types/instagram-webhook-payload.type';

// Case-insensitive, accent-insensitive substring match — matches how a
// "comment KEYWORD" flow is understood colloquially, and avoids surprising
// misses from Portuguese accents (e.g. rule keyword "informação" should
// still match a comment typed "informacao").
const normalizeForMatch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

@Injectable()
export class InstagramCommentAutomationService {
  private readonly logger = new Logger(InstagramCommentAutomationService.name);

  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramAutomationRuleEntity)
    private readonly instagramAutomationRuleRepository: Repository<InstagramAutomationRuleEntity>,
    @InjectRepository(InstagramAutomationTriggerLogEntity)
    private readonly instagramAutomationTriggerLogRepository: Repository<InstagramAutomationTriggerLogEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    @InjectMessageQueue(MessageQueue.instagramQueue)
    private readonly instagramMessageQueueService: MessageQueueService,
  ) {}

  async processComment(
    igBusinessAccountId: string,
    commentValue: InstagramWebhookCommentValue,
  ): Promise<void> {
    const instagramChannel = await this.instagramChannelRepository.findOne({
      where: { igBusinessAccountId },
    });

    if (!instagramChannel) {
      this.logger.warn(
        `Ignoring comment webhook for unknown IG business account ${igBusinessAccountId}`,
      );

      return;
    }

    const matchingRule = await this.findMatchingActiveRule(
      instagramChannel.id,
      commentValue,
    );

    if (!matchingRule) {
      return;
    }

    const claimedTrigger = await this.claimTrigger(
      instagramChannel.workspaceId,
      matchingRule.id,
      commentValue.id,
    );

    if (!claimedTrigger) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOneBy({
      id: instagramChannel.connectedAccountId,
    });

    if (!connectedAccount || !connectedAccount.accessToken) {
      this.logger.error(
        `InstagramChannelEntity ${instagramChannel.id} has no matching ConnectedAccountEntity with an access token`,
      );

      return;
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: instagramChannel.workspaceId,
    });

    // Public acknowledgement comment (e.g. "Sent you a DM!") — best effort,
    // never blocks the private DM below.
    const publicReplyVariations = matchingRule.publicReplyVariations;

    if (publicReplyVariations && publicReplyVariations.length > 0) {
      await this.instagramGraphApiService
        .postPublicReplyToComment(
          commentValue.id,
          accessToken,
          pickRandom(publicReplyVariations),
        )
        .catch((error) => {
          this.logger.error(
            `Failed to post public reply for comment ${commentValue.id}: ${error}`,
          );
        });
    }

    if (!(await this.isAllowedToReceiveDm(matchingRule, commentValue, accessToken))) {
      this.logger.log(
        `Skipping private DM for comment ${commentValue.id}: commenter does not follow the account and requiresFollowToReceiveDm is set`,
      );

      return;
    }

    await this.instagramGraphApiService.sendPrivateReplyToComment(
      igBusinessAccountId,
      accessToken,
      commentValue.id,
      matchingRule.replyMessage,
    );

    await this.scheduleFollowUpIfConfigured(
      matchingRule,
      instagramChannel.id,
      commentValue,
    );
  }

  // "Follow gate": best-effort only — see
  // InstagramGraphApiService.checkIsUserFollowingBusiness for the documented
  // Graph API limitation. `null` (undeterminable) always falls back to
  // "allowed", per the product requirement to never silently drop a DM
  // because of an API constraint we can't do anything about.
  private async isAllowedToReceiveDm(
    rule: InstagramAutomationRuleEntity,
    commentValue: InstagramWebhookCommentValue,
    accessToken: string,
  ): Promise<boolean> {
    if (!rule.requiresFollowToReceiveDm) {
      return true;
    }

    const isFollowing = await this.instagramGraphApiService
      .checkIsUserFollowingBusiness(commentValue.from.id, accessToken)
      .catch(() => null);

    return isFollowing ?? true;
  }

  private async scheduleFollowUpIfConfigured(
    rule: InstagramAutomationRuleEntity,
    instagramChannelId: string,
    commentValue: InstagramWebhookCommentValue,
  ): Promise<void> {
    if (!rule.followUpMessage || !rule.followUpDelayMinutes) {
      return;
    }

    await this.instagramMessageQueueService.add<InstagramFollowUpDmJobData>(
      InstagramFollowUpDmJob.name,
      {
        instagramChannelId,
        recipientIgsid: commentValue.from.id,
        message: rule.followUpMessage,
      },
      { delay: rule.followUpDelayMinutes * 60 * 1000 },
    );
  }

  // Inserts the trigger-log row BEFORE sending the reply, relying on the
  // unique (workspaceId, igCommentId) index to atomically pick a single
  // winner across concurrent webhook redeliveries for the same comment.
  // Returns false if another delivery already claimed (or is claiming) this
  // comment, in which case the caller must not send a reply.
  private async claimTrigger(
    workspaceId: string,
    ruleId: string,
    igCommentId: string,
  ): Promise<boolean> {
    try {
      await this.instagramAutomationTriggerLogRepository.insert({
        workspaceId,
        ruleId,
        igCommentId,
      });

      return true;
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        return false;
      }

      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }

  private async findMatchingActiveRule(
    instagramChannelId: string,
    commentValue: InstagramWebhookCommentValue,
  ): Promise<InstagramAutomationRuleEntity | null> {
    const candidateRules = await this.instagramAutomationRuleRepository.find({
      where: {
        instagramChannelId,
        igMediaId: commentValue.media.id,
        isActive: true,
      },
    });

    const normalizedCommentText = normalizeForMatch(commentValue.text);

    return (
      candidateRules.find((rule) =>
        rule.keywords.some((keyword) =>
          normalizedCommentText.includes(normalizeForMatch(keyword)),
        ),
      ) ?? null
    );
  }
}
