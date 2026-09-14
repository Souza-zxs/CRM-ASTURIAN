import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Idempotency guard: Meta may redeliver the same webhook event, and a single
// comment could (in theory) match more than one active rule on the same
// media. One row per (igCommentId) that has already triggered a private
// reply, so a redelivered webhook is a no-op instead of a duplicate DM.
@Entity({ name: 'instagramAutomationTriggerLog', schema: 'core' })
@Index(
  'IDX_INSTAGRAM_AUTOMATION_TRIGGER_LOG_WORKSPACE_ID_IG_COMMENT_ID',
  ['workspaceId', 'igCommentId'],
  { unique: true },
)
export class InstagramAutomationTriggerLogEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  ruleId: string;

  @ManyToOne(() => InstagramAutomationRuleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleId' })
  rule: Relation<InstagramAutomationRuleEntity>;

  @Column({ type: 'varchar', nullable: false })
  igCommentId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  triggeredAt: Date;
}
