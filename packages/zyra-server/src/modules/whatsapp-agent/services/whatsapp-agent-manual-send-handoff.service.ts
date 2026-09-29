import { Injectable } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

export type DisableAiIfConversationExistsParams = {
  connectedAccountId: string;
  contactPhoneNumber: string;
  workspaceId: string;
};

@Injectable()
export class WhatsappAgentManualSendHandoffService {
  constructor(
    @InjectWorkspaceScopedRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: WorkspaceScopedRepository<WhatsappChannelEntity>,
    @InjectWorkspaceScopedRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: WorkspaceScopedRepository<WhatsappAgentEntity>,
    @InjectWorkspaceScopedRepository(WhatsappAgentConversationEntity)
    private readonly whatsappAgentConversationRepository: WorkspaceScopedRepository<WhatsappAgentConversationEntity>,
    private readonly whatsappAgentConversationMetadataService: WhatsappAgentConversationMetadataService,
  ) {}

  // A human just sent a WhatsApp message manually from the CRM — if the AI
  // agent is configured for this number and already has a conversation row
  // for this contact, stop it from replying over the human from here on.
  async disableAiIfConversationExists({
    connectedAccountId,
    contactPhoneNumber,
    workspaceId,
  }: DisableAiIfConversationExistsParams): Promise<void> {
    const whatsappChannel = await this.whatsappChannelRepository.findOne(
      workspaceId,
      {
        where: { connectedAccountId },
      },
    );

    if (!isDefined(whatsappChannel)) {
      return;
    }

    const whatsappAgent = await this.whatsappAgentRepository.findOne(
      workspaceId,
      {
        where: { whatsappChannelId: whatsappChannel.id },
      },
    );

    if (!isDefined(whatsappAgent)) {
      return;
    }

    const whatsappAgentConversation =
      await this.whatsappAgentConversationRepository.findOne(workspaceId, {
        where: { whatsappAgentId: whatsappAgent.id, contactPhoneNumber },
      });

    if (!isDefined(whatsappAgentConversation)) {
      return;
    }

    await this.whatsappAgentConversationMetadataService.setAiEnabled({
      id: whatsappAgentConversation.id,
      isAiEnabled: false,
      workspaceId,
    });
  }
}
