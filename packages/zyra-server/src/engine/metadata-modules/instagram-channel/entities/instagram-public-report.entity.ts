import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Opt-in, unauthenticated share link for a channel's follower-growth report
// (GET /public/instagram-reports/:shareSlug). One report per channel — the
// owner toggles isEnabled on/off rather than deleting/recreating, so the
// slug stays stable once shared. Only ever exposes data the account owner
// already made public on Instagram (username, profile picture) plus the
// follower counts they explicitly chose to share.
@Entity({ name: 'instagramPublicReport', schema: 'core' })
@Index('IDX_INSTAGRAM_PUBLIC_REPORT_INSTAGRAM_CHANNEL_ID', ['instagramChannelId'], {
  unique: true,
})
@Index('IDX_INSTAGRAM_PUBLIC_REPORT_SHARE_SLUG', ['shareSlug'], {
  unique: true,
})
export class InstagramPublicReportEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  instagramChannelId: string;

  @ManyToOne(() => InstagramChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instagramChannelId' })
  instagramChannel: Relation<InstagramChannelEntity>;

  @Column({ type: 'varchar', nullable: false })
  shareSlug: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isEnabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
