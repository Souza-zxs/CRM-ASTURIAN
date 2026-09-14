import { Injectable } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-metadata.service';
import {
  WhatsappAgentException,
  WhatsappAgentExceptionCode,
} from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class WhatsappAgentConversationMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(WhatsappAgentConversationEntity)
    private readonly whatsappAgentConversationRepository: WorkspaceScopedRepository<WhatsappAgentConversationEntity>,
    private readonly whatsappAgentMetadataService: WhatsappAgentMetadataService,
  ) {}

  async findByWhatsappAgentForWorkspace({
    whatsappAgentId,
    workspaceId,
  }: {
    whatsappAgentId: string;
    workspaceId: string;
  }): Promise<WhatsappAgentConversationEntity[]> {
    // Throws if the agent doesn't exist or belongs to another workspace —
    // the only access check this query gets, same pattern as
    // VoiceCallMetadataService.findByVoiceAgentForWorkspace.
    await this.whatsappAgentMetadataService.findByIdForWorkspace({
      id: whatsappAgentId,
      workspaceId,
    });

    return this.whatsappAgentConversationRepository.find(workspaceId, {
      where: { whatsappAgentId },
      order: { lastMessageAt: 'DESC' },
    });
  }

  async setAiEnabled({
    id,
    isAiEnabled,
    workspaceId,
  }: {
    id: string;
    isAiEnabled: boolean;
    workspaceId: string;
  }): Promise<WhatsappAgentConversationEntity> {
    const conversation = await this.whatsappAgentConversationRepository.findOne(
      workspaceId,
      { where: { id } },
    );

    if (!isDefined(conversation)) {
      throw new WhatsappAgentException(
        `Whatsapp agent conversation ${id} not found`,
        WhatsappAgentExceptionCode.WHATSAPP_AGENT_CONVERSATION_NOT_FOUND,
      );
    }

    await this.whatsappAgentConversationRepository.update(
      workspaceId,
      { id: conversation.id },
      { isAiEnabled },
    );

    return { ...conversation, isAiEnabled };
  }
}
