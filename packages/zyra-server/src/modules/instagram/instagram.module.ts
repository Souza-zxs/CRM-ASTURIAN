import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { InstagramTokenRefreshCronCommand } from 'src/modules/instagram/crons/commands/instagram-token-refresh.cron.command';
import { InstagramTokenRefreshCronJob } from 'src/modules/instagram/crons/jobs/instagram-token-refresh.cron.job';
import { ConnectInstagramAccountResolver } from 'src/modules/instagram/resolvers/connect-instagram-account.resolver';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';
import { InstagramLoginService } from 'src/modules/instagram/services/instagram-login.service';

@Module({
  imports: [
    ZyraConfigModule,
    ConnectedAccountTokenEncryptionModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      MessageChannelEntity,
      InstagramChannelEntity,
    ]),
  ],
  providers: [
    InstagramGraphApiService,
    InstagramLoginService,
    ConnectInstagramAccountResolver,
    InstagramTokenRefreshCronJob,
    InstagramTokenRefreshCronCommand,
  ],
  exports: [InstagramGraphApiService],
})
export class InstagramModule {}
