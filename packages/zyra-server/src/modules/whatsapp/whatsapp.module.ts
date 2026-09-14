import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { ConnectWhatsappNumberResolver } from 'src/modules/whatsapp/resolvers/connect-whatsapp-number.resolver';
import { WhatsappEmbeddedSignupService } from 'src/modules/whatsapp/services/whatsapp-embedded-signup.service';
import { WhatsappGraphApiService } from 'src/modules/whatsapp/services/whatsapp-graph-api.service';

@Module({
  imports: [
    ZyraConfigModule,
    ConnectedAccountTokenEncryptionModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      MessageChannelEntity,
      WhatsappChannelEntity,
    ]),
  ],
  providers: [
    WhatsappGraphApiService,
    WhatsappEmbeddedSignupService,
    ConnectWhatsappNumberResolver,
  ],
  exports: [WhatsappGraphApiService],
})
export class WhatsappModule {}
