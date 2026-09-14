import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import {
  InstagramException,
  InstagramExceptionCode,
} from 'src/modules/instagram/types/instagram.exception';

@Injectable()
export class InstagramChannelMetadataService {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramChannelEntity[]> {
    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    const sharedAccountIds =
      await this.connectedAccountMetadataService.getWorkspaceSharedConnectedAccountIds(
        { workspaceId },
      );

    const connectedAccountIds = [
      ...new Set([...userAccountIds, ...sharedAccountIds]),
    ];

    if (connectedAccountIds.length === 0) {
      return [];
    }

    return this.instagramChannelRepository.find({
      where: { workspaceId, connectedAccountId: In(connectedAccountIds) },
      order: { createdAt: 'ASC' },
    });
  }

  // Ownership check used by the automation rule resolver before letting a
  // user read/create/update/delete rules for a given channel.
  async findByIdForUser({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramChannelEntity> {
    const channels = await this.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId,
    });

    const channel = channels.find((candidate) => candidate.id === id);

    if (!channel) {
      throw new InstagramException(
        `Instagram channel ${id} not found for this user`,
        InstagramExceptionCode.INSTAGRAM_CHANNEL_NOT_FOUND,
      );
    }

    return channel;
  }
}
