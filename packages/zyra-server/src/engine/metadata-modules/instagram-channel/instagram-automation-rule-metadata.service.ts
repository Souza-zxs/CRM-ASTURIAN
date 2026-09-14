import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'zyra-shared/utils';

import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';
import { parseInstagramAutomationRulesCsv } from 'src/engine/metadata-modules/instagram-channel/utils/parse-instagram-automation-rules-csv.util';
import {
  InstagramException,
  InstagramExceptionCode,
} from 'src/modules/instagram/types/instagram.exception';

export type CreateInstagramAutomationRuleData = {
  instagramChannelId: string;
  name: string | null;
  igMediaId: string | null;
  igMediaCaption: string | null;
  igMediaThumbnailUrl: string | null;
  igMediaPermalink: string | null;
  keywords: string[];
  replyMessage: string;
  publicReplyVariations: string[] | null;
  requiresFollowToReceiveDm: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number | null;
  attachToNextReel: boolean;
};

export type UpdateInstagramAutomationRuleData = {
  name?: string | null;
  keywords?: string[];
  replyMessage?: string;
  publicReplyVariations?: string[] | null;
  requiresFollowToReceiveDm?: boolean;
  followUpMessage?: string | null;
  followUpDelayMinutes?: number | null;
  isActive?: boolean;
};

@Injectable()
export class InstagramAutomationRuleMetadataService {
  constructor(
    @InjectRepository(InstagramAutomationRuleEntity)
    private readonly instagramAutomationRuleRepository: Repository<InstagramAutomationRuleEntity>,
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
  }): Promise<InstagramAutomationRuleEntity[]> {
    await this.instagramChannelMetadataService.findByIdForUser({
      id: instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    return this.instagramAutomationRuleRepository.find({
      where: { instagramChannelId, workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    data: CreateInstagramAutomationRuleData,
    {
      userWorkspaceId,
      workspaceId,
    }: {
      userWorkspaceId: string;
      workspaceId: string;
    },
  ): Promise<InstagramAutomationRuleEntity> {
    await this.instagramChannelMetadataService.findByIdForUser({
      id: data.instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    this.assertHasMediaOrIsPending(data);

    return this.instagramAutomationRuleRepository.save({
      workspaceId,
      isActive: true,
      ...data,
    });
  }

  async update({
    id,
    data,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    data: UpdateInstagramAutomationRuleData;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramAutomationRuleEntity> {
    const rule = await this.findByIdForUser({ id, userWorkspaceId, workspaceId });

    const definedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    await this.instagramAutomationRuleRepository.update(rule.id, definedData);

    return {
      ...rule,
      ...definedData,
    };
  }

  async delete({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramAutomationRuleEntity> {
    const rule = await this.findByIdForUser({ id, userWorkspaceId, workspaceId });

    await this.instagramAutomationRuleRepository.delete(rule.id);

    return rule;
  }

  // Clones an existing rule verbatim (including its media attachment, if
  // any) as an inactive draft — inactive by default so duplicating a rule
  // never silently doubles up live automations on the same post.
  async duplicate({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramAutomationRuleEntity> {
    const sourceRule = await this.findByIdForUser({
      id,
      userWorkspaceId,
      workspaceId,
    });

    return this.instagramAutomationRuleRepository.save({
      workspaceId,
      instagramChannelId: sourceRule.instagramChannelId,
      name: `${sourceRule.name ?? sourceRule.keywords.join(', ')} (cópia)`,
      igMediaId: sourceRule.igMediaId,
      igMediaCaption: sourceRule.igMediaCaption,
      igMediaThumbnailUrl: sourceRule.igMediaThumbnailUrl,
      igMediaPermalink: sourceRule.igMediaPermalink,
      keywords: [...sourceRule.keywords],
      replyMessage: sourceRule.replyMessage,
      publicReplyVariations: sourceRule.publicReplyVariations
        ? [...sourceRule.publicReplyVariations]
        : null,
      requiresFollowToReceiveDm: sourceRule.requiresFollowToReceiveDm,
      followUpMessage: sourceRule.followUpMessage,
      followUpDelayMinutes: sourceRule.followUpDelayMinutes,
      attachToNextReel: sourceRule.attachToNextReel,
      isActive: false,
    });
  }

  // Bulk-creates rules from a simple "keywords,replyMessage" CSV. The CSV
  // format has no column for which post to attach to, so every imported
  // rule is created pending (attachToNextReel: true, igMediaId: null) —
  // InstagramAttachNextReelCronJob picks them up once the channel publishes
  // its next Reel. Rows the parser can't make sense of (missing keywords or
  // reply text) are silently skipped rather than failing the whole import.
  async importFromCsv({
    instagramChannelId,
    csvContent,
    userWorkspaceId,
    workspaceId,
  }: {
    instagramChannelId: string;
    csvContent: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramAutomationRuleEntity[]> {
    await this.instagramChannelMetadataService.findByIdForUser({
      id: instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    if (!isNonEmptyString(csvContent)) {
      throw new InstagramException(
        'CSV content is empty',
        InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_CSV_INVALID,
      );
    }

    const rows = parseInstagramAutomationRulesCsv(csvContent);

    if (rows.length === 0) {
      throw new InstagramException(
        'CSV content has no valid rows (expected columns: keywords, replyMessage)',
        InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_CSV_INVALID,
      );
    }

    const rulesToInsert = rows.map((row) => ({
      workspaceId,
      instagramChannelId,
      name: row.keywords.join(', '),
      igMediaId: null,
      igMediaCaption: null,
      igMediaThumbnailUrl: null,
      igMediaPermalink: null,
      keywords: row.keywords,
      replyMessage: row.replyMessage,
      publicReplyVariations: null,
      requiresFollowToReceiveDm: false,
      followUpMessage: null,
      followUpDelayMinutes: null,
      attachToNextReel: true,
      isActive: true,
    }));

    return this.instagramAutomationRuleRepository.save(rulesToInsert);
  }

  private assertHasMediaOrIsPending(
    data: Pick<CreateInstagramAutomationRuleData, 'igMediaId' | 'attachToNextReel'>,
  ): void {
    if (!data.attachToNextReel && !isDefined(data.igMediaId)) {
      throw new InstagramException(
        'igMediaId is required unless attachToNextReel is set',
        InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_MEDIA_REQUIRED,
      );
    }
  }

  private async findByIdForUser({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<InstagramAutomationRuleEntity> {
    const rule = await this.instagramAutomationRuleRepository.findOne({
      where: { id, workspaceId },
    });

    if (!rule) {
      throw new InstagramException(
        `Instagram automation rule ${id} not found`,
        InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_NOT_FOUND,
      );
    }

    await this.instagramChannelMetadataService.findByIdForUser({
      id: rule.instagramChannelId,
      userWorkspaceId,
      workspaceId,
    });

    return rule;
  }
}
