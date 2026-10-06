import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEmailAttachmentModule } from 'src/engine/core-modules/file/file-email-attachment/file-email-attachment.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { PlanTierModule } from 'src/engine/core-modules/plan-tier/plan-tier.module';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappAgentModule } from 'src/modules/whatsapp-agent/whatsapp-agent.module';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { SendEmailResolver } from 'src/modules/messaging/message-outbound-manager/resolvers/send-email.resolver';
import { MessagingSendManagerModule } from 'src/modules/messaging/message-outbound-manager/messaging-send-manager.module';
import { SendWhatsappMessageResolver } from 'src/modules/messaging/message-outbound-manager/resolvers/send-whatsapp-message.resolver';
import { SendWhatsappMessageService } from 'src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service';

@Module({
  imports: [
    FileEmailAttachmentModule,
    ToolModule,
    MessagingSendManagerModule,
    ConnectedAccountMetadataModule,
    PermissionsModule,
    PlanTierModule,
    WhatsappAgentModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity, WhatsappChannelEntity]),
  ],
  providers: [
    SendEmailResolver,
    SendWhatsappMessageService,
    SendWhatsappMessageResolver,
    provideWorkspaceScopedRepository(ConnectedAccountEntity),
    provideWorkspaceScopedRepository(WhatsappChannelEntity),
  ],
})
export class SendEmailModule {}
