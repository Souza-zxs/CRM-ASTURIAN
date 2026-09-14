import { InjectRepository } from '@nestjs/typeorm';

import { LessThanOrEqual, Repository } from 'typeorm';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';

export const INSTAGRAM_TOKEN_REFRESH_CRON_PATTERN = '0 4 * * *';

// Instagram long-lived tokens are valid ~60 days and must be refreshed
// before they expire — Meta requires at least 24h of remaining validity for
// a refresh call to succeed. Runs daily and refreshes anything expiring in
// the next 7 days, giving several days of retry headroom if a refresh call
// fails (network blip, Meta outage) before the token actually dies.
const REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

@Processor(MessageQueue.cronQueue)
export class InstagramTokenRefreshCronJob {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(InstagramTokenRefreshCronJob.name)
  @SentryCronMonitor(
    InstagramTokenRefreshCronJob.name,
    INSTAGRAM_TOKEN_REFRESH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const expiringChannels = await this.instagramChannelRepository.find({
      where: {
        isSyncEnabled: true,
        accessTokenExpiresAt: LessThanOrEqual(
          new Date(Date.now() + REFRESH_WINDOW_MS),
        ),
      },
    });

    for (const channel of expiringChannels) {
      await this.refreshChannelToken(channel).catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: channel.workspaceId },
        });
      });
    }
  }

  private async refreshChannelToken(
    channel: InstagramChannelEntity,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.findOneBy({
      id: channel.connectedAccountId,
    });

    if (!connectedAccount || !connectedAccount.accessToken) {
      return;
    }

    const currentAccessToken =
      this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: connectedAccount.accessToken,
        workspaceId: channel.workspaceId,
      });

    const { accessToken, expiresInSeconds } =
      await this.instagramGraphApiService.refreshLongLivedToken(
        currentAccessToken,
      );

    const encryptedAccessToken =
      this.connectedAccountTokenEncryptionService.encrypt({
        plaintext: accessToken as PlaintextString,
        workspaceId: channel.workspaceId,
      });

    await this.connectedAccountRepository.update(connectedAccount.id, {
      accessToken: encryptedAccessToken,
      lastCredentialsRefreshedAt: new Date(),
    });

    await this.instagramChannelRepository.update(channel.id, {
      accessTokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });
  }
}
