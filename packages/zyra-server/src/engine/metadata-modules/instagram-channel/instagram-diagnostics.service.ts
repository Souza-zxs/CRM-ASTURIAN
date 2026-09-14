import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { InstagramTokenStatus } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-diagnostics.dto';
import { InstagramAutomationTriggerLogEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-trigger-log.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';

// Same 7-day window InstagramTokenRefreshCronJob uses to decide a token
// needs refreshing — reused here so "EXPIRING_SOON" means the same thing in
// diagnostics as it does in the refresh cron.
const TOKEN_EXPIRING_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type InstagramDiagnostics = {
  lastWebhookReceivedAt: Date | null;
  lastReconciliationAt: Date | null;
  tokenStatus: InstagramTokenStatus;
  pendingJobsCount: number;
  failedJobsCount: number;
};

@Injectable()
export class InstagramDiagnosticsService {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramAutomationTriggerLogEntity)
    private readonly instagramAutomationTriggerLogRepository: Repository<InstagramAutomationTriggerLogEntity>,
    private readonly instagramChannelMetadataService: InstagramChannelMetadataService,
    @InjectMessageQueue(MessageQueue.instagramQueue)
    private readonly instagramMessageQueueService: MessageQueueService,
  ) {}

  async getDiagnosticsForUser({
    instagramChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramDiagnostics> {
    const channel = await this.instagramChannelMetadataService.findByIdForUser(
      {
        id: instagramChannelId,
        userWorkspaceId,
        workspaceId,
      },
    );

    const [lastTrigger, jobCounts] = await Promise.all([
      this.instagramAutomationTriggerLogRepository.findOne({
        where: { rule: { instagramChannelId }, workspaceId },
        order: { triggeredAt: 'DESC' },
      }),
      this.instagramMessageQueueService.getJobCounts(),
    ]);

    return {
      lastWebhookReceivedAt: lastTrigger?.triggeredAt ?? null,
      lastReconciliationAt: channel.lastReconciliationAt,
      tokenStatus: this.computeTokenStatus(channel.accessTokenExpiresAt),
      pendingJobsCount:
        (jobCounts.waiting ?? 0) +
        (jobCounts.delayed ?? 0) +
        (jobCounts.active ?? 0),
      failedJobsCount: jobCounts.failed ?? 0,
    };
  }

  private computeTokenStatus(
    accessTokenExpiresAt: Date | null,
  ): InstagramTokenStatus {
    if (!accessTokenExpiresAt) {
      return InstagramTokenStatus.UNKNOWN;
    }

    const millisecondsUntilExpiry =
      accessTokenExpiresAt.getTime() - Date.now();

    if (millisecondsUntilExpiry <= 0) {
      return InstagramTokenStatus.EXPIRED;
    }

    if (millisecondsUntilExpiry <= TOKEN_EXPIRING_SOON_WINDOW_MS) {
      return InstagramTokenStatus.EXPIRING_SOON;
    }

    return InstagramTokenStatus.VALID;
  }
}
