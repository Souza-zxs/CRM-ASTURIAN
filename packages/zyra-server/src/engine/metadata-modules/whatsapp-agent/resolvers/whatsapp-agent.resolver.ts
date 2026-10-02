import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  RequirePlanGatedFeature,
  WorkspacePlanTierGuard,
} from 'src/engine/guards/workspace-plan-tier.guard';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { CreateWhatsappAgentInput } from 'src/engine/metadata-modules/whatsapp-agent/dtos/create-whatsapp-agent.input';
import { UpdateWhatsappAgentInput } from 'src/engine/metadata-modules/whatsapp-agent/dtos/update-whatsapp-agent.input';
import { WhatsappAgentDTO } from 'src/engine/metadata-modules/whatsapp-agent/dtos/whatsapp-agent.dto';
import { WhatsappAgentMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-metadata.service';

@UseGuards(WorkspaceAuthGuard, WorkspacePlanTierGuard)
@MetadataResolver(() => WhatsappAgentDTO)
export class WhatsappAgentResolver {
  constructor(
    private readonly whatsappAgentMetadataService: WhatsappAgentMetadataService,
  ) {}

  @Query(() => [WhatsappAgentDTO])
  @UseGuards(NoPermissionGuard)
  @RequirePlanGatedFeature(PlanGatedFeature.WHATSAPP)
  async myWhatsappAgents(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentDTO[]> {
    return this.whatsappAgentMetadataService.findByWorkspaceId({
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WhatsappAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequirePlanGatedFeature(PlanGatedFeature.WHATSAPP)
  async createWhatsappAgent(
    @Args('input') input: CreateWhatsappAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentDTO> {
    return this.whatsappAgentMetadataService.create(
      {
        whatsappChannelId: input.whatsappChannelId,
        name: input.name,
        systemPrompt: input.systemPrompt,
        greetingMessage: input.greetingMessage ?? null,
        forbiddenPhrases: input.forbiddenPhrases ?? null,
        qualificationCriteria: input.qualificationCriteria ?? null,
        knowledgeBase: input.knowledgeBase ?? null,
        handoffInstructions: input.handoffInstructions ?? null,
        model: input.model ?? null,
      },
      { workspaceId: workspace.id },
    );
  }

  @Mutation(() => WhatsappAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequirePlanGatedFeature(PlanGatedFeature.WHATSAPP)
  async updateWhatsappAgent(
    @Args('input') input: UpdateWhatsappAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentDTO> {
    return this.whatsappAgentMetadataService.update({
      id: input.id,
      data: {
        name: input.name,
        isActive: input.isActive,
        systemPrompt: input.systemPrompt,
        greetingMessage: input.greetingMessage,
        forbiddenPhrases: input.forbiddenPhrases,
        qualificationCriteria: input.qualificationCriteria,
        knowledgeBase: input.knowledgeBase,
        handoffInstructions: input.handoffInstructions,
        model: input.model,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WhatsappAgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequirePlanGatedFeature(PlanGatedFeature.WHATSAPP)
  async deleteWhatsappAgent(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentDTO> {
    return this.whatsappAgentMetadataService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
