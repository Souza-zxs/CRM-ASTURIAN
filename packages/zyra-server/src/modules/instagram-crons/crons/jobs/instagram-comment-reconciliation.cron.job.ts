import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';
import { InstagramCommentAutomationService } from 'src/modules/instagram-webhooks/services/instagram-comment-automation.service';
import { type InstagramWebhookCommentValue } from 'src/modules/instagram-webhooks/types/instagram-webhook-payload.type';

export const INSTAGRAM_COMMENT_RECONCILIATION_CRON_PATTERN = '*/20 * * * *';

// Safety net for missed webhook deliveries: re-fetches recent comments for
// every media an active rule points to and replays them through the exact
// same InstagramCommentAutomationService.processComment used by the live
// webhook path. That method is idempotent (the (workspaceId, igCommentId)
// unique index in InstagramAutomationTriggerLogEntity makes claiming a
// trigger atomic), so re-processing an already-handled comment here is a
// safe no-op — only comments the webhook truly never reached us for result
// in a (still deduped) reply.
@Processor(MessageQueue.cronQueue)
export class InstagramCommentReconciliationCronJob {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramAutomationRuleEntity)
    private readonly instagramAutomationRuleRepository: Repository<InstagramAutomationRuleEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly instagramCommentAutomationService: InstagramCommentAutomationService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(InstagramCommentReconciliationCronJob.name)
  @SentryCronMonitor(
    InstagramCommentReconciliationCronJob.name,
    INSTAGRAM_COMMENT_RECONCILIATION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeRulesWithMedia = await this.instagramAutomationRuleRepository.find(
      {
        where: { isActive: true, igMediaId: Not(IsNull()) },
      },
    );

    const ruleIdsByChannelId = new Map<string, InstagramAutomationRuleEntity[]>();

    for (const rule of activeRulesWithMedia) {
      const rulesForChannel =
        ruleIdsByChannelId.get(rule.instagramChannelId) ?? [];

      rulesForChannel.push(rule);
      ruleIdsByChannelId.set(rule.instagramChannelId, rulesForChannel);
    }

    for (const [instagramChannelId, rules] of ruleIdsByChannelId) {
      await this.reconcileChannel(instagramChannelId, rules).catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: rules[0]?.workspaceId },
        });
      });
    }
  }

  private async reconcileChannel(
    instagramChannelId: string,
    rules: InstagramAutomationRuleEntity[],
  ): Promise<void> {
    const channel = await this.instagramChannelRepository.findOneBy({
      id: instagramChannelId,
    });

    if (!channel) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOneBy({
      id: channel.connectedAccountId,
    });

    if (!connectedAccount || !connectedAccount.accessToken) {
      return;
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: channel.workspaceId,
    });

    const uniqueMediaIds = [
      ...new Set(
        rules
          .map((rule) => rule.igMediaId)
          .filter((igMediaId): igMediaId is string => igMediaId !== null),
      ),
    ];

    for (const mediaId of uniqueMediaIds) {
      await this.reconcileMedia(channel, mediaId, accessToken).catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: channel.workspaceId },
        });
      });
    }

    // Recorded even if an individual media lookup above failed — this
    // timestamp means "the sweep ran for this channel", which is what
    // Query.instagramDiagnostics needs to tell a stuck cron apart from a
    // cron that ran and legitimately found nothing to do.
    await this.instagramChannelRepository.update(channel.id, {
      lastReconciliationAt: new Date(),
    });
  }

  private async reconcileMedia(
    channel: InstagramChannelEntity,
    mediaId: string,
    accessToken: string,
  ): Promise<void> {
    const comments = await this.instagramGraphApiService.listMediaComments(
      mediaId,
      accessToken,
    );

    for (const comment of comments) {
      const commentValue: InstagramWebhookCommentValue = {
        id: comment.id,
        text: comment.text,
        from: {
          id: comment.from?.id ?? '',
          username: comment.from?.username ?? comment.username,
        },
        media: { id: mediaId },
      };

      await this.instagramCommentAutomationService.processComment(
        channel.igBusinessAccountId,
        commentValue,
      );
    }
  }
}
