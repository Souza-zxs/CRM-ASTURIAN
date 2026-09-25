import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappTemplateEntity } from 'src/engine/metadata-modules/whatsapp-template/entities/whatsapp-template.entity';
import { SendWhatsappTemplateWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/send-whatsapp-template.workflow-action';
import { WhatsappModule } from 'src/modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    WhatsappModule,
    TypeOrmModule.forFeature([
      WhatsappTemplateEntity,
      WhatsappChannelEntity,
      ConnectedAccountEntity,
    ]),
  ],
  providers: [SendWhatsappTemplateWorkflowAction],
  exports: [SendWhatsappTemplateWorkflowAction],
})
export class SendWhatsappTemplateActionModule {}
