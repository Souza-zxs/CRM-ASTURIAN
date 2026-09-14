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

// A "comment KEYWORD -> private reply DM" automation, scoped to a single
// Instagram media (post). Media metadata (caption/thumbnail/permalink) is
// cached at creation time from the Graph API so the rule list can render
// without a live API call per row — it's display-only, never used for
// matching (matching happens against the live inbound comment text, keyed by
// igMediaId).
//
// igMediaId (and the cached media metadata) is nullable to support
// "campaign" rules created ahead of a post existing yet — see
// attachToNextReel below, filled in later by
// InstagramAttachNextReelCronJob once the creator actually publishes.
@Entity({ name: 'instagramAutomationRule', schema: 'core' })
@Index('IDX_INSTAGRAM_AUTOMATION_RULE_WORKSPACE_ID_IG_MEDIA_ID', [
  'workspaceId',
  'igMediaId',
])
export class InstagramAutomationRuleEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  instagramChannelId: string;

  @ManyToOne(() => InstagramChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instagramChannelId' })
  instagramChannel: Relation<InstagramChannelEntity>;

  // Display name for the campaign list — nullable since rules created
  // before this field existed have none (the front falls back to showing
  // keywords in that case). Used to build the "(cópia)" suffix on
  // Mutation.duplicateInstagramAutomationRule.
  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  // Nullable: a rule with attachToNextReel=true can be created before the
  // target Reel is published — see the class comment above.
  @Column({ type: 'varchar', nullable: true })
  igMediaId: string | null;

  @Column({ type: 'varchar', nullable: true })
  igMediaCaption: string | null;

  @Column({ type: 'varchar', nullable: true })
  igMediaThumbnailUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  igMediaPermalink: string | null;

  // Case-insensitive substring match: a comment triggers the rule if it
  // contains ANY of these keywords. Stored as simple-array (comma-joined
  // varchar column) since keyword lists are short and never queried
  // individually — the match itself happens in application code against the
  // inbound comment text, not via SQL.
  @Column({ type: 'simple-array', nullable: false })
  keywords: string[];

  // Private DM sent to the commenter via the "private reply" Graph API
  // endpoint. Kept as a single field (rather than folded into
  // publicReplyVariations) since the DM is the actual automation payload —
  // only the public-facing acknowledgement comment benefits from variety.
  @Column({ type: 'text', nullable: false })
  replyMessage: string;

  // Variations of a PUBLIC comment posted back as a reply to the triggering
  // comment (e.g. "Sent you a DM! 📩"), so the automation doesn't look like
  // it's repeating the exact same visible text on every comment. One is
  // picked at random per trigger. Null/empty means no public reply is
  // posted — replyMessage (the private DM) is unaffected either way.
  @Column({ type: 'simple-array', nullable: true })
  publicReplyVariations: string[] | null;

  // "Follow gate": only send the private DM if the commenter follows the
  // account. Best-effort — see InstagramCommentAutomationService for the
  // documented Graph API limitation (there is no reliable, generally
  // available "does user X follow business account Y" endpoint for
  // Instagram Login accounts, so this degrades to "always send" when the
  // check can't be performed).
  @Column({ type: 'boolean', nullable: false, default: false })
  requiresFollowToReceiveDm: boolean;

  // Optional second DM sent followUpDelayMinutes after the first one, via a
  // delayed BullMQ job (see InstagramFollowUpDmJob) — not a polling cron.
  @Column({ type: 'text', nullable: true })
  followUpMessage: string | null;

  @Column({ type: 'int', nullable: true })
  followUpDelayMinutes: number | null;

  // When true, this rule may be created with igMediaId still NULL — an
  // InstagramAttachNextReelCronJob run fills igMediaId (and the cached media
  // metadata) with the channel's next published Reel automatically.
  @Column({ type: 'boolean', nullable: false, default: false })
  attachToNextReel: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
