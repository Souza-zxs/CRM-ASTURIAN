import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// One row per channel per day, written by InstagramFollowerSnapshotCronJob.
// Powers the follower-growth chart (Query.instagramFollowerHistory) and the
// optional public growth report (InstagramPublicReportEntity) — a plain
// time series, never mutated after insert.
@Entity({ name: 'instagramFollowerSnapshot', schema: 'core' })
@Index('IDX_INSTAGRAM_FOLLOWER_SNAPSHOT_CHANNEL_ID_CAPTURED_AT', [
  'instagramChannelId',
  'capturedAt',
])
export class InstagramFollowerSnapshotEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  instagramChannelId: string;

  @ManyToOne(() => InstagramChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instagramChannelId' })
  instagramChannel: Relation<InstagramChannelEntity>;

  @Column({ type: 'int', nullable: false })
  followerCount: number;

  @Column({ type: 'timestamptz', nullable: false })
  capturedAt: Date;
}
