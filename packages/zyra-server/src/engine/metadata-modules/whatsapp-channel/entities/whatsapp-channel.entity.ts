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
  name: 'WhatsappChannelSyncStatus',
});

// Connection-specific data for a WhatsApp Business number (Embedded Signup
// output): phone_number_id/waba_id and display info. Deliberately NOT folded
// into MessageChannelEntity's own columns — those are IMAP/Gmail-shaped
// (folders, sync cursor, push-subscription IDs) and don't apply here. A
// plain MessageChannelEntity row (type WHATSAPP) is still created alongside
// this one, purely as the join point into the existing Message/Thread/
// Participant + contact-creation pipeline, which takes a MessageChannelEntity
// as a hard dependency (see MessagingSaveMessagesAndEnqueueContactCreationService).
@Entity({ name: 'whatsappChannel', schema: 'core' })
@Index('IDX_WHATSAPP_CHANNEL_WORKSPACE_ID_PHONE_NUMBER_ID', [
  'workspaceId',
  'phoneNumberId',
])
export class WhatsappChannelEntity extends WorkspaceRelatedEntity {
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

  // Meta's identifier for the specific phone number (used in every Graph API
  // send/receive call — the stable id, unlike the human-readable number).
  // Globally unique: a given Meta phone_number_id can only ever belong to one
  // workspace, and inbound webhook routing looks channels up by this id alone
  // (see WhatsappInboundMessageImportService) — the constraint plus the
  // upsert in WhatsappEmbeddedSignupService.connectNumber prevent duplicate
  // rows from routing messages to a stale channel on reconnect.
  @Column({ type: 'varchar', nullable: false, unique: true })
  phoneNumberId: string;

  // The WhatsApp Business Account id this number belongs to (one WABA can
  // hold multiple numbers; we key by phoneNumberId, but keep wabaId for
  // Graph API calls that operate at the WABA level, e.g. template listing).
  @Column({ type: 'varchar', nullable: false })
  wabaId: string;

  // Human-readable number as returned by the Graph API (e.g. "+55 11 91234-5678"),
  // shown in the connection settings UI.
  @Column({ type: 'varchar', nullable: false })
  displayPhoneNumber: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isSyncEnabled: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStatus,
    nullable: false,
    default: MessageChannelSyncStatus.NOT_SYNCED,
  })
  syncStatus: MessageChannelSyncStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
