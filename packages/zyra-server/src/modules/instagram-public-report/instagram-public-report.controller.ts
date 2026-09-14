import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { Repository } from 'typeorm';

import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramPublicReportEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-public-report.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

// Fully unauthenticated, read-only report a channel owner explicitly
// opted into sharing (see Mutation.enableInstagramPublicReport) — mirrors
// InstagramWebhooksController's pattern of a plain, guard-marked public
// route. Deliberately narrow: it exposes only what's already public on
// Instagram (username, profile picture) plus follower counts the owner
// chose to share, and nothing else about the workspace or channel.
@Controller('public/instagram-reports')
export class InstagramPublicReportController {
  constructor(
    @InjectRepository(InstagramPublicReportEntity)
    private readonly instagramPublicReportRepository: Repository<InstagramPublicReportEntity>,
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(InstagramFollowerSnapshotEntity)
    private readonly instagramFollowerSnapshotRepository: Repository<InstagramFollowerSnapshotEntity>,
  ) {}

  @Get(':shareSlug')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPublicReport(
    @Param('shareSlug') shareSlug: string,
    @Res() response: Response,
  ): Promise<void> {
    const report = await this.instagramPublicReportRepository.findOneBy({
      shareSlug,
      isEnabled: true,
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const channel = await this.instagramChannelRepository.findOneBy({
      id: report.instagramChannelId,
    });

    if (!channel) {
      throw new NotFoundException('Report not found');
    }

    const followerHistory = await this.instagramFollowerSnapshotRepository.find(
      {
        where: { instagramChannelId: channel.id },
        order: { capturedAt: 'ASC' },
      },
    );

    response.status(HttpStatus.OK).json({
      username: channel.username,
      profilePictureUrl: channel.profilePictureUrl,
      followerHistory: followerHistory.map((snapshot) => ({
        followerCount: snapshot.followerCount,
        capturedAt: snapshot.capturedAt,
      })),
    });
  }
}
