import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';

@Injectable()
export class WhatsappChannelMetadataService {
  constructor(
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<WhatsappChannelEntity[]> {
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

    return this.whatsappChannelRepository.find({
      where: { workspaceId, connectedAccountId: In(connectedAccountIds) },
      order: { createdAt: 'ASC' },
    });
  }
}
