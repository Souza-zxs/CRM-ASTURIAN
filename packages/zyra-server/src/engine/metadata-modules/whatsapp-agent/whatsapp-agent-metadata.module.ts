import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentMessageEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-message.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentConversationResolver } from 'src/engine/metadata-modules/whatsapp-agent/resolvers/whatsapp-agent-conversation.resolver';
import { WhatsappAgentResolver } from 'src/engine/metadata-modules/whatsapp-agent/resolvers/whatsapp-agent.resolver';
import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';
import { WhatsappAgentMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-metadata.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// WhatsappAgentMessageEntity is registered here (forFeature) so the runtime
// responder module can rely on this module having created the table
// mapping, but it has no metadata service/resolver of its own — its history
// is read/written only by WhatsappAgentResponderService, never exposed over
// GraphQL (see the CRUD contract: only the agent and conversation are
// queryable/mutable from the front-end).
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappAgentEntity,
      WhatsappAgentConversationEntity,
      WhatsappAgentMessageEntity,
      WhatsappChannelEntity,
    ]),
    PermissionsModule,
  ],
  providers: [
    WhatsappAgentMetadataService,
    WhatsappAgentConversationMetadataService,
    WhatsappAgentResolver,
    WhatsappAgentConversationResolver,
    provideWorkspaceScopedRepository(WhatsappAgentEntity),
    provideWorkspaceScopedRepository(WhatsappAgentConversationEntity),
    provideWorkspaceScopedRepository(WhatsappChannelEntity),
  ],
  exports: [
    WhatsappAgentMetadataService,
    WhatsappAgentConversationMetadataService,
  ],
})
export class WhatsappAgentMetadataModule {}
