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

import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Configuration for an AI agent that auto-replies to inbound WhatsApp
// messages on behalf of a connected number. One agent per channel today (see
// the unique index below) — kept 1:1 for simplicity, same call the voice
// agent made; revisit if multiple personas per number is ever needed.
@Entity({ name: 'whatsappAgent', schema: 'core' })
@Index('IDX_WHATSAPP_AGENT_WHATSAPP_CHANNEL_ID', ['whatsappChannelId'], {
  unique: true,
})
export class WhatsappAgentEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'uuid', nullable: false })
  whatsappChannelId: string;

  @ManyToOne(() => WhatsappChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'whatsappChannelId' })
  whatsappChannel: Relation<WhatsappChannelEntity>;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: false })
  systemPrompt: string;

  @Column({ type: 'text', nullable: true })
  greetingMessage: string | null;

  // Case-insensitive substrings the model is instructed never to use in a
  // reply — same simple-array pattern as InstagramAutomationRuleEntity.keywords.
  @Column({ type: 'simple-array', nullable: true })
  forbiddenPhrases: string[] | null;

  @Column({ type: 'text', nullable: true })
  qualificationCriteria: string | null;

  // Free-text instructions telling the model when to stop responding and
  // flag the conversation for a human (see WhatsappAgentResponderService,
  // which also flips WhatsappAgentConversationEntity.isAiEnabled to false
  // once the model reports wantsHumanHandoff).
  @Column({ type: 'text', nullable: true })
  handoffInstructions: string | null;

  // Configurable on purpose — revisit before shipping to production, this
  // default is a reasonable-cost placeholder, not a vetted choice.
  @Column({ type: 'varchar', nullable: false, default: 'gpt-4.1-mini' })
  model: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
