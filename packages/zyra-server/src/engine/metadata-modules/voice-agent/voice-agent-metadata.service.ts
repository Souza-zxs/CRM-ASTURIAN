import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { type VoiceAgentWeeklyAvailability } from 'src/engine/metadata-modules/voice-agent/types/weekly-availability.type';
import {
  VoiceAgentException,
  VoiceAgentExceptionCode,
} from 'src/engine/metadata-modules/voice-agent/voice-agent.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CreateVoiceAgentData = {
  name: string;
  systemPrompt: string;
  phoneNumber: string | null;
  voice: string | null;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  transferPhoneNumber: string | null;
  weeklyAvailability: VoiceAgentWeeklyAvailability | null;
};

export type UpdateVoiceAgentData = {
  name?: string;
  isActive?: boolean;
  phoneNumber?: string | null;
  voice?: string;
  systemPrompt?: string;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  transferPhoneNumber?: string | null;
  weeklyAvailability?: VoiceAgentWeeklyAvailability | null;
};

const DEFAULT_VOICE = 'alloy';

@Injectable()
export class VoiceAgentMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(VoiceAgentEntity)
    private readonly voiceAgentRepository: WorkspaceScopedRepository<VoiceAgentEntity>,
    // Phone numbers must be globally unique across workspaces (Twilio's
    // inbound webhook has no workspace context to disambiguate with) — see
    // assertPhoneNumberIsAvailable.
    // eslint-disable-next-line zyra/prefer-workspace-scoped-repository
    @InjectRepository(VoiceAgentEntity)
    private readonly voiceAgentRepositoryUnscoped: Repository<VoiceAgentEntity>,
  ) {}

  async findByWorkspaceId({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<VoiceAgentEntity[]> {
    return this.voiceAgentRepository.find(workspaceId, {
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdForWorkspace({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<VoiceAgentEntity> {
    const voiceAgent = await this.voiceAgentRepository.findOne(workspaceId, {
      where: { id },
    });

    if (!voiceAgent) {
      throw new VoiceAgentException(
        `Voice agent ${id} not found`,
        VoiceAgentExceptionCode.VOICE_AGENT_NOT_FOUND,
      );
    }

    return voiceAgent;
  }

  async create(
    data: CreateVoiceAgentData,
    { workspaceId }: { workspaceId: string },
  ): Promise<VoiceAgentEntity> {
    await this.assertPhoneNumberIsAvailable(data.phoneNumber);

    return this.voiceAgentRepository.save(workspaceId, {
      ...data,
      isActive: true,
      voice: data.voice ?? DEFAULT_VOICE,
    });
  }

  async update({
    id,
    data,
    workspaceId,
  }: {
    id: string;
    data: UpdateVoiceAgentData;
    workspaceId: string;
  }): Promise<VoiceAgentEntity> {
    const voiceAgent = await this.findByIdForWorkspace({ id, workspaceId });

    if (data.phoneNumber !== undefined) {
      await this.assertPhoneNumberIsAvailable(data.phoneNumber, id);
    }

    const definedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    await this.voiceAgentRepository.update(
      workspaceId,
      { id: voiceAgent.id },
      definedData,
    );

    return {
      ...voiceAgent,
      ...definedData,
    };
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<VoiceAgentEntity> {
    const voiceAgent = await this.findByIdForWorkspace({ id, workspaceId });

    await this.voiceAgentRepository.delete(workspaceId, { id: voiceAgent.id });

    return voiceAgent;
  }

  // A Twilio number can only ever ring one agent — same "globally unique"
  // rationale as WhatsappChannelEntity.phoneNumberId, since the inbound
  // webhook has no workspace context to disambiguate with.
  private async assertPhoneNumberIsAvailable(
    phoneNumber: string | null | undefined,
    excludeVoiceAgentId?: string,
  ): Promise<void> {
    if (!phoneNumber) {
      return;
    }

    const existing = await this.voiceAgentRepositoryUnscoped.findOne({
      where: { phoneNumber },
    });

    if (existing && existing.id !== excludeVoiceAgentId) {
      throw new VoiceAgentException(
        `Phone number ${phoneNumber} is already assigned to another voice agent`,
        VoiceAgentExceptionCode.VOICE_AGENT_PHONE_NUMBER_ALREADY_IN_USE,
      );
    }
  }
}
