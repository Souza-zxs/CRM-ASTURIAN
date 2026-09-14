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
import { WhatsappAgentConversationDTO } from 'src/engine/metadata-modules/whatsapp-agent/dtos/whatsapp-agent-conversation.dto';
import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => WhatsappAgentConversationDTO)
export class WhatsappAgentConversationResolver {
  constructor(
    private readonly whatsappAgentConversationMetadataService: WhatsappAgentConversationMetadataService,
  ) {}

  @Query(() => [WhatsappAgentConversationDTO])
  @UseGuards(NoPermissionGuard)
  async whatsappAgentConversations(
    @Args('whatsappAgentId', { type: () => UUIDScalarType })
    whatsappAgentId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentConversationDTO[]> {
    return this.whatsappAgentConversationMetadataService.findByWhatsappAgentForWorkspace(
      { whatsappAgentId, workspaceId: workspace.id },
    );
  }

  @Mutation(() => WhatsappAgentConversationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async setWhatsappAgentConversationAiEnabled(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('isAiEnabled', { type: () => Boolean }) isAiEnabled: boolean,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappAgentConversationDTO> {
    return this.whatsappAgentConversationMetadataService.setAiEnabled({
      id,
      isAiEnabled,
      workspaceId: workspace.id,
    });
  }
}
