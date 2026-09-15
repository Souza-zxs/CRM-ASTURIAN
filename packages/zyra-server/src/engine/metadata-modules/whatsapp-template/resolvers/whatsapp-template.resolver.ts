import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateWhatsappTemplateInput } from 'src/engine/metadata-modules/whatsapp-template/dtos/create-whatsapp-template.input';
import { UpdateWhatsappTemplateInput } from 'src/engine/metadata-modules/whatsapp-template/dtos/update-whatsapp-template.input';
import { WhatsappTemplateDTO } from 'src/engine/metadata-modules/whatsapp-template/dtos/whatsapp-template.dto';
import { WhatsappTemplateMetadataService } from 'src/engine/metadata-modules/whatsapp-template/whatsapp-template-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => WhatsappTemplateDTO)
export class WhatsappTemplateResolver {
  constructor(
    private readonly whatsappTemplateMetadataService: WhatsappTemplateMetadataService,
  ) {}

  @Query(() => [WhatsappTemplateDTO])
  @UseGuards(NoPermissionGuard)
  async myWhatsappTemplates(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappTemplateDTO[]> {
    return this.whatsappTemplateMetadataService.findAllForWorkspace(
      workspace.id,
    );
  }

  @Mutation(() => WhatsappTemplateDTO)
  @UseGuards(NoPermissionGuard)
  async createWhatsappTemplate(
    @Args('input') input: CreateWhatsappTemplateInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappTemplateDTO> {
    return this.whatsappTemplateMetadataService.create({
      workspaceId: workspace.id,
      input,
    });
  }

  @Mutation(() => WhatsappTemplateDTO)
  @UseGuards(NoPermissionGuard)
  async updateWhatsappTemplate(
    @Args('input') input: UpdateWhatsappTemplateInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappTemplateDTO> {
    return this.whatsappTemplateMetadataService.update({
      workspaceId: workspace.id,
      input,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(NoPermissionGuard)
  async deleteWhatsappTemplate(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.whatsappTemplateMetadataService.delete({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WhatsappTemplateDTO)
  @UseGuards(NoPermissionGuard)
  async submitWhatsappTemplateForApproval(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappTemplateDTO> {
    return this.whatsappTemplateMetadataService.submitForApproval({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WhatsappTemplateDTO)
  @UseGuards(NoPermissionGuard)
  async refreshWhatsappTemplateStatus(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappTemplateDTO> {
    return this.whatsappTemplateMetadataService.refreshStatus({
      id,
      workspaceId: workspace.id,
    });
  }
}
