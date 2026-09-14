import { Injectable } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import {
  WhatsappAgentException,
  WhatsappAgentExceptionCode,
} from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent.exception';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CreateWhatsappAgentData = {
  whatsappChannelId: string;
  name: string;
  systemPrompt: string;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  model: string | null;
};

export type UpdateWhatsappAgentData = {
  name?: string;
  isActive?: boolean;
  systemPrompt?: string;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  model?: string;
};

const DEFAULT_MODEL = 'gpt-4.1-mini';

@Injectable()
export class WhatsappAgentMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: WorkspaceScopedRepository<WhatsappAgentEntity>,
    @InjectWorkspaceScopedRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: WorkspaceScopedRepository<WhatsappChannelEntity>,
  ) {}

  async findByWorkspaceId({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<WhatsappAgentEntity[]> {
    return this.whatsappAgentRepository.find(workspaceId, {
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdForWorkspace({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsappAgentEntity> {
    const whatsappAgent = await this.whatsappAgentRepository.findOne(
      workspaceId,
      { where: { id } },
    );

    if (!isDefined(whatsappAgent)) {
      throw new WhatsappAgentException(
        `Whatsapp agent ${id} not found`,
        WhatsappAgentExceptionCode.WHATSAPP_AGENT_NOT_FOUND,
      );
    }

    return whatsappAgent;
  }

  async create(
    data: CreateWhatsappAgentData,
    { workspaceId }: { workspaceId: string },
  ): Promise<WhatsappAgentEntity> {
    const whatsappChannel = await this.whatsappChannelRepository.findOne(
      workspaceId,
      { where: { id: data.whatsappChannelId } },
    );

    if (!isDefined(whatsappChannel)) {
      throw new WhatsappAgentException(
        `Whatsapp channel ${data.whatsappChannelId} not found`,
        WhatsappAgentExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    // One agent per channel — see the unique index on
    // WhatsappAgentEntity.whatsappChannelId. Check up front to return a
    // friendly error instead of surfacing the raw DB constraint violation.
    const existingAgentForChannel = await this.whatsappAgentRepository.findOne(
      workspaceId,
      { where: { whatsappChannelId: data.whatsappChannelId } },
    );

    if (isDefined(existingAgentForChannel)) {
      throw new WhatsappAgentException(
        `Whatsapp channel ${data.whatsappChannelId} already has an agent`,
        WhatsappAgentExceptionCode.WHATSAPP_AGENT_ALREADY_EXISTS_FOR_CHANNEL,
      );
    }

    return this.whatsappAgentRepository.save(workspaceId, {
      whatsappChannelId: data.whatsappChannelId,
      name: data.name,
      systemPrompt: data.systemPrompt,
      greetingMessage: data.greetingMessage,
      forbiddenPhrases: data.forbiddenPhrases,
      qualificationCriteria: data.qualificationCriteria,
      handoffInstructions: data.handoffInstructions,
      model: data.model ?? DEFAULT_MODEL,
      isActive: true,
    });
  }

  async update({
    id,
    data,
    workspaceId,
  }: {
    id: string;
    data: UpdateWhatsappAgentData;
    workspaceId: string;
  }): Promise<WhatsappAgentEntity> {
    const whatsappAgent = await this.findByIdForWorkspace({ id, workspaceId });

    const definedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    await this.whatsappAgentRepository.update(
      workspaceId,
      { id: whatsappAgent.id },
      definedData,
    );

    return {
      ...whatsappAgent,
      ...definedData,
    };
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsappAgentEntity> {
    const whatsappAgent = await this.findByIdForWorkspace({ id, workspaceId });

    await this.whatsappAgentRepository.delete(workspaceId, {
      id: whatsappAgent.id,
    });

    return whatsappAgent;
  }
}
