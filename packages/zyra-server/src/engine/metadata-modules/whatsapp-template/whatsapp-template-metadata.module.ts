import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappTemplateEntity } from 'src/engine/metadata-modules/whatsapp-template/entities/whatsapp-template.entity';
import { WhatsappTemplateResolver } from 'src/engine/metadata-modules/whatsapp-template/resolvers/whatsapp-template.resolver';
import { WhatsappTemplateMetadataService } from 'src/engine/metadata-modules/whatsapp-template/whatsapp-template-metadata.service';
import { WhatsappModule } from 'src/modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    WhatsappModule,
    ConnectedAccountTokenEncryptionModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      WhatsappTemplateEntity,
      WhatsappChannelEntity,
      ConnectedAccountEntity,
    ]),
  ],
  providers: [WhatsappTemplateMetadataService, WhatsappTemplateResolver],
  exports: [WhatsappTemplateMetadataService],
})
export class WhatsappTemplateMetadataModule {}
