import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappChannelResolver } from 'src/engine/metadata-modules/whatsapp-channel/resolvers/whatsapp-channel.resolver';
import { WhatsappChannelMetadataService } from 'src/engine/metadata-modules/whatsapp-channel/whatsapp-channel-metadata.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappChannelEntity]),
    PermissionsModule,
    ConnectedAccountMetadataModule,
  ],
  providers: [WhatsappChannelMetadataService, WhatsappChannelResolver],
  exports: [WhatsappChannelMetadataService],
})
export class WhatsappChannelMetadataModule {}
