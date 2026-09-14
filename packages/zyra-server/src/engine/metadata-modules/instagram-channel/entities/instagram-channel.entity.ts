import { registerEnumType } from '@nestjs/graphql';

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

import { MessageChannelSyncStatus } from 'zyra-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(MessageChannelSyncStatus, {
  name: 'InstagramChannelSyncStatus',
});

// Connection-specific data for a connected Instagram professional account
// (Instagram Login output): the IG-scoped business account id and display
// info. Deliberately NOT folded into MessageChannelEntity's own columns —
// those are IMAP/Gmail-shaped (folders, sync cursor, push-subscription IDs)
// and don't apply here. A plain MessageChannelEntity row (type INSTAGRAM) is
// still created alongside this one, purely as the join point into the
// existing Message/Thread/Participant + contact-creation pipeline, which
// takes a MessageChannelEntity as a hard dependency (see
// MessagingSaveMessagesAndEnqueueContactCreationService) — mirrors
// WhatsappChannelEntity's relationship to MessageChannelEntity exactly.
@Entity({ name: 'instagramChannel', schema: 'core' })
@Index('IDX_INSTAGRAM_CHANNEL_WORKSPACE_ID_IG_BUSINESS_ACCOUNT_ID', [
  'workspaceId',
  'igBusinessAccountId',
])
export class InstagramChannelEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  messageChannelId: string;

  @ManyToOne(() => MessageChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageChannelId' })
  messageChannel: Relation<MessageChannelEntity>;

  @Column({ type: 'uuid', nullable: false })
  connectedAccountId: string;

  @ManyToOne(() => ConnectedAccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectedAccountId' })
  connectedAccount: Relation<ConnectedAccountEntity>;

  // Meta's identifier for the connected Instagram professional account
  // (used in every Graph API call — media listing, comments, private
  // replies). Globally unique: a given ig_business_account_id can only ever
  // belong to one workspace, and inbound webhook routing looks channels up
  // by this id alone (see InstagramCommentAutomationService) — the
  // constraint plus the upsert in InstagramLoginService.connectAccount
  // prevent duplicate rows from routing comments to a stale channel on
  // reconnect.
  @Column({ type: 'varchar', nullable: false, unique: true })
  igBusinessAccountId: string;

  // Instagram @handle, shown in the connection settings UI.
  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  profilePictureUrl: string | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  isSyncEnabled: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStatus,
    nullable: false,
    default: MessageChannelSyncStatus.NOT_SYNCED,
  })
  syncStatus: MessageChannelSyncStatus;

  // Expiry of the long-lived access token stored on the related
  // ConnectedAccountEntity (~60 days from issuance/refresh per Meta's
  // "Instagram API with Instagram Login" token model). Read by
  // InstagramTokenRefreshCronJob to refresh tokens before they expire.
  @Column({ type: 'timestamptz', nullable: true })
  accessTokenExpiresAt: Date | null;

  // Last time InstagramCommentReconciliationCronJob successfully finished a
  // pass over this channel's rules — surfaced by Query.instagramDiagnostics
  // as a health signal (a stale value means the safety-net reconciliation
  // sweep itself is failing, independent of whether webhooks are flowing).
  @Column({ type: 'timestamptz', nullable: true })
  lastReconciliationAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
