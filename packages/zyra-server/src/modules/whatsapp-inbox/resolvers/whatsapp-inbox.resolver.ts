import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WhatsappConversationDTO } from 'src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver(() => WhatsappConversationDTO)
export class WhatsappInboxResolver {
  constructor(private readonly whatsappInboxService: WhatsappInboxService) {}

  @Query(() => String, { nullable: true })
  async getWhatsappThreadIdForPerson(
    @Args('personId', { type: () => UUIDScalarType }) personId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return this.whatsappInboxService.getThreadIdForPerson(
      personId,
      workspace.id,
    );
  }

  @Query(() => [WhatsappConversationDTO])
  async getWhatsappConversations(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappConversationDTO[]> {
    return this.whatsappInboxService.getConversations(workspace.id);
  }
}
