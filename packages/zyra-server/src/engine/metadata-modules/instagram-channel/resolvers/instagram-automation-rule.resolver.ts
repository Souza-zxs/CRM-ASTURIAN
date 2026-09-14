import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { INSTAGRAM_CAMPAIGN_TEMPLATES } from 'src/engine/metadata-modules/instagram-channel/constants/instagram-campaign-templates.constant';
import { CreateInstagramAutomationRuleInput } from 'src/engine/metadata-modules/instagram-channel/dtos/create-instagram-automation-rule.input';
import { InstagramAutomationRuleDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-automation-rule.dto';
import { InstagramCampaignTemplateDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-campaign-template.dto';
import { UpdateInstagramAutomationRuleInput } from 'src/engine/metadata-modules/instagram-channel/dtos/update-instagram-automation-rule.input';
import { InstagramAutomationRuleMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-automation-rule-metadata.service';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => InstagramAutomationRuleDTO)
export class InstagramAutomationRuleResolver {
  constructor(
    private readonly instagramAutomationRuleMetadataService: InstagramAutomationRuleMetadataService,
  ) {}

  @Query(() => [InstagramAutomationRuleDTO])
  @UseGuards(NoPermissionGuard)
  async instagramAutomationRules(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO[]> {
    return this.instagramAutomationRuleMetadataService.findByChannelForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  // Static, hardcoded list — see INSTAGRAM_CAMPAIGN_TEMPLATES. Pre-fills the
  // front-end's campaign builder form, nothing more.
  @Query(() => [InstagramCampaignTemplateDTO])
  @UseGuards(NoPermissionGuard)
  instagramCampaignTemplates(): InstagramCampaignTemplateDTO[] {
    return INSTAGRAM_CAMPAIGN_TEMPLATES;
  }

  @Mutation(() => InstagramAutomationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async createInstagramAutomationRule(
    @Args('input') input: CreateInstagramAutomationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO> {
    return this.instagramAutomationRuleMetadataService.create(
      {
        instagramChannelId: input.instagramChannelId,
        name: input.name ?? null,
        igMediaId: input.igMediaId ?? null,
        igMediaCaption: input.igMediaCaption ?? null,
        igMediaThumbnailUrl: input.igMediaThumbnailUrl ?? null,
        igMediaPermalink: input.igMediaPermalink ?? null,
        keywords: input.keywords,
        replyMessage: input.replyMessage,
        publicReplyVariations: input.publicReplyVariations ?? null,
        requiresFollowToReceiveDm: input.requiresFollowToReceiveDm ?? false,
        followUpMessage: input.followUpMessage ?? null,
        followUpDelayMinutes: input.followUpDelayMinutes ?? null,
        attachToNextReel: input.attachToNextReel ?? false,
      },
      { userWorkspaceId, workspaceId: workspace.id },
    );
  }

  @Mutation(() => InstagramAutomationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async updateInstagramAutomationRule(
    @Args('input') input: UpdateInstagramAutomationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO> {
    return this.instagramAutomationRuleMetadataService.update({
      id: input.id,
      data: {
        name: input.name,
        keywords: input.keywords,
        replyMessage: input.replyMessage,
        publicReplyVariations: input.publicReplyVariations,
        requiresFollowToReceiveDm: input.requiresFollowToReceiveDm,
        followUpMessage: input.followUpMessage,
        followUpDelayMinutes: input.followUpDelayMinutes,
        isActive: input.isActive,
      },
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => InstagramAutomationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async deleteInstagramAutomationRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO> {
    return this.instagramAutomationRuleMetadataService.delete({
      id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => InstagramAutomationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async duplicateInstagramAutomationRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO> {
    return this.instagramAutomationRuleMetadataService.duplicate({
      id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => [InstagramAutomationRuleDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async importInstagramAutomationRulesFromCsv(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @Args('csvContent') csvContent: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramAutomationRuleDTO[]> {
    return this.instagramAutomationRuleMetadataService.importFromCsv({
      instagramChannelId,
      csvContent,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }
}
