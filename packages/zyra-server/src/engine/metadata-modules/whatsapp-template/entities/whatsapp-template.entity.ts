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

import {
  WhatsappTemplateCategory,
  type WhatsappTemplateButton,
  WhatsappTemplateStatus,
} from 'zyra-shared/types';

import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(WhatsappTemplateCategory, { name: 'WhatsappTemplateCategory' });
registerEnumType(WhatsappTemplateStatus, { name: 'WhatsappTemplateStatus' });

// Local record of a WhatsApp message template, mirroring what Meta needs to
// approve one (name/category/language/components). Created here as a draft,
// then submitted to the Graph API's message_templates endpoint for approval
// — see WhatsappGraphApiService.createMessageTemplate. Templates are the
// only way to message a contact outside the 24h customer-service window
// (see automacao-whatsapp.md), so this closes that gap end to end.
@Entity({ name: 'whatsappTemplate', schema: 'core' })
@Index('IDX_WHATSAPP_TEMPLATE_WORKSPACE_ID_NAME_LANGUAGE', [
  'workspaceId',
  'name',
  'language',
])
export class WhatsappTemplateEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  whatsappChannelId: string;

  @ManyToOne(() => WhatsappChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'whatsappChannelId' })
  whatsappChannel: Relation<WhatsappChannelEntity>;

  // Meta requires lowercase letters/digits/underscores only.
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: WhatsappTemplateCategory,
    nullable: false,
  })
  category: WhatsappTemplateCategory;

  // BCP-47-ish locale code Meta expects, e.g. "pt_BR".
  @Column({ type: 'varchar', nullable: false })
  language: string;

  @Column({ type: 'varchar', nullable: true })
  headerText: string | null;

  // Body text with {{1}}, {{2}}... placeholders.
  @Column({ type: 'text', nullable: false })
  bodyText: string;

  @Column({ type: 'varchar', nullable: true })
  footerText: string | null;

  @Column({ type: 'jsonb', nullable: true })
  buttons: WhatsappTemplateButton[] | null;

  @Column({
    type: 'enum',
    enum: WhatsappTemplateStatus,
    nullable: false,
    default: WhatsappTemplateStatus.DRAFT,
  })
  status: WhatsappTemplateStatus;

  // Set once submitForApproval succeeds — Meta's id for this template,
  // used both to poll status and to reference it when sending.
  @Column({ type: 'varchar', nullable: true })
  metaTemplateId: string | null;

  // Raw status string as last reported by Meta (e.g. "PENDING", "APPROVED",
  // "REJECTED") — kept alongside the local `status` enum since Meta's values
  // don't always map 1:1 (e.g. "PAUSED", "DISABLED").
  @Column({ type: 'varchar', nullable: true })
  metaTemplateStatus: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
