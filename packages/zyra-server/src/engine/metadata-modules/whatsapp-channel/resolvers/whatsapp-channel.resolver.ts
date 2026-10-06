import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  RequirePlanGatedFeature,
  WorkspacePlanTierGuard,
} from 'src/engine/guards/workspace-plan-tier.guard';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WhatsappChannelDTO } from 'src/engine/metadata-modules/whatsapp-channel/dtos/whatsapp-channel.dto';
import { WhatsappChannelMetadataService } from 'src/engine/metadata-modules/whatsapp-channel/whatsapp-channel-metadata.service';

@UseGuards(WorkspaceAuthGuard, WorkspacePlanTierGuard)
@MetadataResolver(() => WhatsappChannelDTO)
export class WhatsappChannelResolver {
  constructor(
    private readonly whatsappChannelMetadataService: WhatsappChannelMetadataService,
  ) {}

  @Query(() => [WhatsappChannelDTO])
  @UseGuards(NoPermissionGuard)
  @RequirePlanGatedFeature(PlanGatedFeature.WHATSAPP)
  async myWhatsappChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<WhatsappChannelDTO[]> {
    return this.whatsappChannelMetadataService.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }
}
