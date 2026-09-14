import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { InstagramPublicReportDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-public-report.dto';
import { InstagramPublicReportMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-public-report-metadata.service';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => InstagramPublicReportDTO)
export class InstagramPublicReportResolver {
  constructor(
    private readonly instagramPublicReportMetadataService: InstagramPublicReportMetadataService,
  ) {}

  @Query(() => InstagramPublicReportDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async instagramPublicReport(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramPublicReportDTO | null> {
    return this.instagramPublicReportMetadataService.findByChannelForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => InstagramPublicReportDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async enableInstagramPublicReport(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramPublicReportDTO> {
    return this.instagramPublicReportMetadataService.enable({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => InstagramPublicReportDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async disableInstagramPublicReport(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramPublicReportDTO> {
    return this.instagramPublicReportMetadataService.disable({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }
}
