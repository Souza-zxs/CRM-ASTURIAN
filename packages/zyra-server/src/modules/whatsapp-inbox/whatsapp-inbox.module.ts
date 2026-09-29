import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WhatsappInboxResolver } from 'src/modules/whatsapp-inbox/resolvers/whatsapp-inbox.resolver';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannelEntity])],
  providers: [WhatsappInboxService, WhatsappInboxResolver],
})
export class WhatsappInboxModule {}
