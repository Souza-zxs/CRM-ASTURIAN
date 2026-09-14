import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InstagramPublicReportEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-public-report.entity';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';

const SHARE_SLUG_BYTE_LENGTH = 16; // -> 22 url-safe base64 characters
const MAX_SLUG_GENERATION_ATTEMPTS = 5;

@Injectable()
export class InstagramPublicReportMetadataService {
  constructor(
    @InjectRepository(InstagramPublicReportEntity)
    private readonly instagramPublicReportRepository: Repository<InstagramPublicReportEntity>,
    private readonly instagramChannelMetadataService: InstagramChannelMetadataService,
  ) {}

  async findByChannelForUser({
    instagramChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramPublicReportEntity | null> {
    await this.instagramChannelMetadataService.findByIdForUser({
      id: instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    return this.instagramPublicReportRepository.findOneBy({
      instagramChannelId,
      workspaceId,
    });
  }

  async enable({
    instagramChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramPublicReportEntity> {
    const existingReport = await this.findByChannelForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    if (existingReport) {
      await this.instagramPublicReportRepository.update(existingReport.id, {
        isEnabled: true,
      });

      return { ...existingReport, isEnabled: true };
    }

    return this.instagramPublicReportRepository.save({
      workspaceId,
      instagramChannelId,
      shareSlug: await this.generateUniqueShareSlug(),
      isEnabled: true,
    });
  }

  async disable({
    instagramChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramPublicReportEntity> {
    const existingReport = await this.findByChannelForUser({
      instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    // Nothing to disable — return a not-yet-persisted, disabled placeholder
    // so callers always get back a well-formed DTO.
    if (!existingReport) {
      return {
        id: '',
        workspaceId,
        instagramChannelId,
        shareSlug: '',
        isEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as InstagramPublicReportEntity;
    }

    await this.instagramPublicReportRepository.update(existingReport.id, {
      isEnabled: false,
    });

    return { ...existingReport, isEnabled: false };
  }

  private async generateUniqueShareSlug(): Promise<string> {
    for (let attempt = 0; attempt < MAX_SLUG_GENERATION_ATTEMPTS; attempt += 1) {
      const candidateSlug = randomBytes(SHARE_SLUG_BYTE_LENGTH).toString(
        'base64url',
      );

      const existingReportWithSlug =
        await this.instagramPublicReportRepository.findOneBy({
          shareSlug: candidateSlug,
        });

      if (!existingReportWithSlug) {
        return candidateSlug;
      }
    }

    throw new Error(
      'Failed to generate a unique Instagram public report share slug after several attempts',
    );
  }
}
