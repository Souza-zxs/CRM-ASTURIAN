import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateFunnelPageInput } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-page.input';
import { FunnelPageDTO } from 'src/engine/metadata-modules/funnel-page/dtos/funnel-page.dto';
import { UpdateFunnelPageInput } from 'src/engine/metadata-modules/funnel-page/dtos/update-funnel-page.input';
import { FunnelPageMetadataService } from 'src/engine/metadata-modules/funnel-page/funnel-page-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => FunnelPageDTO)
export class FunnelPageResolver {
  constructor(
    private readonly funnelPageMetadataService: FunnelPageMetadataService,
  ) {}

  @Query(() => [FunnelPageDTO])
  @UseGuards(NoPermissionGuard)
  async funnelPages(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO[]> {
    return this.funnelPageMetadataService.findAllForWorkspace(workspace.id);
  }

  @Query(() => FunnelPageDTO)
  @UseGuards(NoPermissionGuard)
  async funnelPage(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO> {
    return this.funnelPageMetadataService.findOneForWorkspace({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => FunnelPageDTO)
  @UseGuards(NoPermissionGuard)
  async createFunnelPage(
    @Args('input') input: CreateFunnelPageInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO> {
    return this.funnelPageMetadataService.create({
      workspaceId: workspace.id,
      input,
    });
  }

  @Mutation(() => FunnelPageDTO)
  @UseGuards(NoPermissionGuard)
  async updateFunnelPage(
    @Args('input') input: UpdateFunnelPageInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO> {
    return this.funnelPageMetadataService.update({
      id: input.id,
      workspaceId: workspace.id,
      input,
    });
  }

  @Mutation(() => FunnelPageDTO)
  @UseGuards(NoPermissionGuard)
  async publishFunnelPage(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO> {
    return this.funnelPageMetadataService.publish({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => FunnelPageDTO)
  @UseGuards(NoPermissionGuard)
  async unpublishFunnelPage(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FunnelPageDTO> {
    return this.funnelPageMetadataService.unpublish({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(NoPermissionGuard)
  async deleteFunnelPage(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.funnelPageMetadataService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
