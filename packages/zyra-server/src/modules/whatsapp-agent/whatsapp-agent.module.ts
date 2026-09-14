import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentMessageEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-message.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { MessagingSendManagerModule } from 'src/modules/messaging/message-outbound-manager/messaging-send-manager.module';
import { WhatsappAgentResponderJob } from 'src/modules/whatsapp-agent/jobs/whatsapp-agent-responder.job';
import { WhatsappAgentInstructionsBuilderService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-instructions-builder.service';
import { WhatsappAgentOpenAiClientService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-openai-client.service';
import { WhatsappAgentResponderService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-responder.service';
import { WhatsappAgentTriggerService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-trigger.service';

// The runtime half of the WhatsApp AI agent feature (queue + job + the actual
// OpenAI call), separate from WhatsappAgentMetadataModule (CRUD/GraphQL) —
// same split as the voice agent's engine/metadata-modules/voice-agent vs
// modules/voice-agent. Only WhatsappAgentTriggerService is exported: that's
// the one thing WhatsappWebhooksModule needs to hook into after an inbound
// message is saved.
@Module({
  imports: [
    ZyraConfigModule,
    MessagingSendManagerModule,
    TypeOrmModule.forFeature([
      WhatsappAgentEntity,
      WhatsappAgentConversationEntity,
      WhatsappAgentMessageEntity,
      WhatsappChannelEntity,
      ConnectedAccountEntity,
    ]),
  ],
  providers: [
    WhatsappAgentTriggerService,
    WhatsappAgentResponderService,
    WhatsappAgentResponderJob,
    WhatsappAgentInstructionsBuilderService,
    WhatsappAgentOpenAiClientService,
    provideWorkspaceScopedRepository(WhatsappAgentEntity),
    provideWorkspaceScopedRepository(WhatsappAgentConversationEntity),
    provideWorkspaceScopedRepository(WhatsappAgentMessageEntity),
    provideWorkspaceScopedRepository(WhatsappChannelEntity),
  ],
  exports: [WhatsappAgentTriggerService],
})
export class WhatsappAgentModule {}
