import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import {
  type InstagramMediaSummary,
  InstagramGraphApiService,
} from 'src/modules/instagram/services/instagram-graph-api.service';

export const INSTAGRAM_ATTACH_NEXT_REEL_CRON_PATTERN = '*/15 * * * *';

const REEL_MEDIA_PRODUCT_TYPE = 'REELS';

// Fills in igMediaId (and the cached media metadata) for rules created with
// attachToNextReel=true — see InstagramAutomationRuleEntity's class comment.
// "Next Reel" is defined relative to when the rule was created: the first
// Reel found with a Graph API timestamp AFTER the rule's createdAt. This
// avoids needing an extra "last known reel id" cursor column on
// InstagramChannelEntity — a rule simply waits until a Reel newer than
// itself shows up.
@Processor(MessageQueue.cronQueue)
export class InstagramAttachNextReelCronJob {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramAutomationRuleEntity)
    private readonly instagramAutomationRuleRepository: Repository<InstagramAutomationRuleEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(InstagramAttachNextReelCronJob.name)
  @SentryCronMonitor(
    InstagramAttachNextReelCronJob.name,
    INSTAGRAM_ATTACH_NEXT_REEL_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const pendingRules = await this.instagramAutomationRuleRepository.find({
      where: { attachToNextReel: true, igMediaId: IsNull(), isActive: true },
    });

    const pendingRulesByChannelId = new Map<
      string,
      InstagramAutomationRuleEntity[]
    >();

    for (const rule of pendingRules) {
      const rulesForChannel =
        pendingRulesByChannelId.get(rule.instagramChannelId) ?? [];

      rulesForChannel.push(rule);
      pendingRulesByChannelId.set(rule.instagramChannelId, rulesForChannel);
    }

    for (const [instagramChannelId, rules] of pendingRulesByChannelId) {
      await this.attachNextReelForChannel(instagramChannelId, rules).catch(
        (error) => {
          this.exceptionHandlerService.captureExceptions([error], {
            workspace: { id: rules[0]?.workspaceId },
          });
        },
      );
    }
  }

  private async attachNextReelForChannel(
    instagramChannelId: string,
    pendingRules: InstagramAutomationRuleEntity[],
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

    const recentMedia = await this.instagramGraphApiService.listRecentMedia(
      channel.igBusinessAccountId,
      accessToken,
    );

    const recentReels = recentMedia
      .filter((media) => media.media_product_type === REEL_MEDIA_PRODUCT_TYPE)
      .sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (recentReels.length === 0) {
      return;
    }

    const latestReel = recentReels[0];
    const latestReelPublishedAt = new Date(latestReel.timestamp);

    for (const rule of pendingRules) {
      if (latestReelPublishedAt <= rule.createdAt) {
        continue;
      }

      await this.attachMediaToRule(rule, latestReel);
    }
  }

  private async attachMediaToRule(
    rule: InstagramAutomationRuleEntity,
    media: InstagramMediaSummary,
  ): Promise<void> {
    await this.instagramAutomationRuleRepository.update(rule.id, {
      igMediaId: media.id,
      igMediaCaption: media.caption ?? null,
      igMediaThumbnailUrl: media.thumbnail_url ?? media.media_url ?? null,
      igMediaPermalink: media.permalink,
    });
  }
}
