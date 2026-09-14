import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';

@Injectable()
export class InstagramFollowerSnapshotMetadataService {
  constructor(
    @InjectRepository(InstagramFollowerSnapshotEntity)
    private readonly instagramFollowerSnapshotRepository: Repository<InstagramFollowerSnapshotEntity>,
    private readonly instagramChannelMetadataService: InstagramChannelMetadataService,
  ) {}

  async findHistoryForUser({
    instagramChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramFollowerSnapshotEntity[]> {
    await this.instagramChannelMetadataService.findByIdForUser({
      id: instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    return this.instagramFollowerSnapshotRepository.find({
      where: { instagramChannelId, workspaceId },
      order: { capturedAt: 'ASC' },
    });
  }
}
