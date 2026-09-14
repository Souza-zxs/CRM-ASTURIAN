import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateVoiceAgentInput } from 'src/engine/metadata-modules/voice-agent/dtos/create-voice-agent.input';
import { UpdateVoiceAgentInput } from 'src/engine/metadata-modules/voice-agent/dtos/update-voice-agent.input';
import { VoiceAgentDTO } from 'src/engine/metadata-modules/voice-agent/dtos/voice-agent.dto';
import { VoiceAgentMetadataService } from 'src/engine/metadata-modules/voice-agent/voice-agent-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => VoiceAgentDTO)
export class VoiceAgentResolver {
  constructor(
    private readonly voiceAgentMetadataService: VoiceAgentMetadataService,
  ) {}

  @Query(() => [VoiceAgentDTO])
  @UseGuards(NoPermissionGuard)
  async myVoiceAgents(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<VoiceAgentDTO[]> {
    return this.voiceAgentMetadataService.findByWorkspaceId({
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => VoiceAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async createVoiceAgent(
    @Args('input') input: CreateVoiceAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<VoiceAgentDTO> {
    return this.voiceAgentMetadataService.create(
      {
        name: input.name,
        systemPrompt: input.systemPrompt,
        phoneNumber: input.phoneNumber ?? null,
        voice: input.voice ?? null,
        greetingMessage: input.greetingMessage ?? null,
        forbiddenPhrases: input.forbiddenPhrases ?? null,
        qualificationCriteria: input.qualificationCriteria ?? null,
        handoffInstructions: input.handoffInstructions ?? null,
        transferPhoneNumber: input.transferPhoneNumber ?? null,
        weeklyAvailability: input.weeklyAvailability ?? null,
      },
      { workspaceId: workspace.id },
    );
  }

  @Mutation(() => VoiceAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async updateVoiceAgent(
    @Args('input') input: UpdateVoiceAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<VoiceAgentDTO> {
    return this.voiceAgentMetadataService.update({
      id: input.id,
      data: {
        name: input.name,
        isActive: input.isActive,
        phoneNumber: input.phoneNumber,
        voice: input.voice,
        systemPrompt: input.systemPrompt,
        greetingMessage: input.greetingMessage,
        forbiddenPhrases: input.forbiddenPhrases,
        qualificationCriteria: input.qualificationCriteria,
        handoffInstructions: input.handoffInstructions,
        transferPhoneNumber: input.transferPhoneNumber,
        weeklyAvailability: input.weeklyAvailability,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => VoiceAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async deleteVoiceAgent(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<VoiceAgentDTO> {
    return this.voiceAgentMetadataService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
