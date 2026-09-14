import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { WhatsappInboundMessageImportJob } from 'src/modules/whatsapp-webhooks/jobs/whatsapp-inbound-message-import.job';
import { WhatsappInboundMessageImportService } from 'src/modules/whatsapp-webhooks/services/whatsapp-inbound-message-import.service';
import { WhatsappInboundWebhookRouterService } from 'src/modules/whatsapp-webhooks/services/whatsapp-inbound-webhook-router.service';
import { WhatsappSignatureVerifierService } from 'src/modules/whatsapp-webhooks/services/whatsapp-signature-verifier.service';
import { WhatsappWebhooksController } from 'src/modules/whatsapp-webhooks/whatsapp-webhooks.controller';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappAgentModule } from 'src/modules/whatsapp-agent/whatsapp-agent.module';

@Module({
  imports: [
    ZyraConfigModule,
    MessagingImportManagerModule,
    WhatsappAgentModule,
    TypeOrmModule.forFeature([
      WhatsappChannelEntity,
      MessageChannelEntity,
      ConnectedAccountEntity,
    ]),
  ],
  controllers: [WhatsappWebhooksController],
  providers: [
    WhatsappSignatureVerifierService,
    WhatsappInboundWebhookRouterService,
    WhatsappInboundMessageImportService,
    WhatsappInboundMessageImportJob,
  ],
})
export class WhatsappWebhooksModule {}
