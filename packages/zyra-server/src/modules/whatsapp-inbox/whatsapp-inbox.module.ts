import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PlanTierModule } from 'src/engine/core-modules/plan-tier/plan-tier.module';
import { WhatsappInboxResolver } from 'src/modules/whatsapp-inbox/resolvers/whatsapp-inbox.resolver';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannelEntity]), PlanTierModule],
  providers: [WhatsappInboxService, WhatsappInboxResolver],
})
export class WhatsappInboxModule {}
