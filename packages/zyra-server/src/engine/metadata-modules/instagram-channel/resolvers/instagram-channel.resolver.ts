import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { InstagramChannelDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-channel.dto';
import { InstagramDiagnosticsDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-diagnostics.dto';
import { InstagramFollowerSnapshotDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-follower-snapshot.dto';
import { InstagramMediaSummaryDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-media-summary.dto';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';
import { InstagramDiagnosticsService } from 'src/engine/metadata-modules/instagram-channel/instagram-diagnostics.service';
import { InstagramFollowerSnapshotMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-follower-snapshot-metadata.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => InstagramChannelDTO)
export class InstagramChannelResolver {
  constructor(
    private readonly instagramChannelMetadataService: InstagramChannelMetadataService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramFollowerSnapshotMetadataService: InstagramFollowerSnapshotMetadataService,
    private readonly instagramDiagnosticsService: InstagramDiagnosticsService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  @Query(() => [InstagramChannelDTO])
  @UseGuards(NoPermissionGuard)
  async myInstagramChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramChannelDTO[]> {
    return this.instagramChannelMetadataService.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  // Backs the post-picker in the "new automation rule" form.
  @Query(() => [InstagramMediaSummaryDTO])
  @UseGuards(NoPermissionGuard)
  async instagramRecentMedia(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramMediaSummaryDTO[]> {
    const channel = await this.instagramChannelMetadataService.findByIdForUser(
      {
        id: instagramChannelId,
        userWorkspaceId,
        workspaceId: workspace.id,
      },
    );

    const connectedAccount = await this.connectedAccountRepository.findOneBy({
      id: channel.connectedAccountId,
    });

    if (!connectedAccount || !connectedAccount.accessToken) {
      throw new NotFoundException(
        'Connected account not found or has no access token',
      );
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: workspace.id,
    });

    const media = await this.instagramGraphApiService.listRecentMedia(
      channel.igBusinessAccountId,
      accessToken,
    );

    return media.map((item) => ({
      id: item.id,
      caption: item.caption ?? null,
      thumbnailUrl: item.thumbnail_url ?? item.media_url ?? null,
      permalink: item.permalink,
    }));
  }

  // Powers the follower-growth chart — see InstagramFollowerSnapshotCronJob
  // for how the underlying rows are populated (once daily, per channel).
  @Query(() => [InstagramFollowerSnapshotDTO])
  @UseGuards(NoPermissionGuard)
  async instagramFollowerHistory(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramFollowerSnapshotDTO[]> {
    return this.instagramFollowerSnapshotMetadataService.findHistoryForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Query(() => InstagramDiagnosticsDTO)
  @UseGuards(NoPermissionGuard)
  async instagramDiagnostics(
    @Args('instagramChannelId', { type: () => UUIDScalarType })
    instagramChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InstagramDiagnosticsDTO> {
    return this.instagramDiagnosticsService.getDiagnosticsForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }
}
