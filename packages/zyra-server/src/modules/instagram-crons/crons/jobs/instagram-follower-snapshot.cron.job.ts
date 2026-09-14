import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';

export const INSTAGRAM_FOLLOWER_SNAPSHOT_CRON_PATTERN = '0 5 * * *';

// Daily follower-count snapshot per connected channel, via the IG User
// node's `followers_count` field
// (https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user#fields)
// — powers the growth chart (Query.instagramFollowerHistory) and the
// optional public report.
@Processor(MessageQueue.cronQueue)
export class InstagramFollowerSnapshotCronJob {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramFollowerSnapshotEntity)
    private readonly instagramFollowerSnapshotRepository: Repository<InstagramFollowerSnapshotEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(InstagramFollowerSnapshotCronJob.name)
  @SentryCronMonitor(
    InstagramFollowerSnapshotCronJob.name,
    INSTAGRAM_FOLLOWER_SNAPSHOT_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeChannels = await this.instagramChannelRepository.find({
      where: { isSyncEnabled: true },
    });

    for (const channel of activeChannels) {
      await this.snapshotChannel(channel).catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: channel.workspaceId },
        });
      });
    }
  }

  private async snapshotChannel(channel: InstagramChannelEntity): Promise<void> {
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

    const followerCount = await this.instagramGraphApiService.getFollowerCount(
      channel.igBusinessAccountId,
      accessToken,
    );

    await this.instagramFollowerSnapshotRepository.save({
      workspaceId: channel.workspaceId,
      instagramChannelId: channel.id,
      followerCount,
      capturedAt: new Date(),
    });
  }
}
