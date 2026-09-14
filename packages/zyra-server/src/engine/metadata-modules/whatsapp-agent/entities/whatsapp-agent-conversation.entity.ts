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

import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Tracks the AI agent's own state for one ongoing WhatsApp conversation with
// a single contact — independent from the CRM's unified inbox (Message/
// Thread/Participant), which keeps the full human-readable conversation.
// This table exists purely so the agent has a cheap, self-contained place to
// read/write "did a human take over" and "what's the latest qualification",
// same separation of concerns as crm-imobiliario's own `messages` table.
@Entity({ name: 'whatsappAgentConversation', schema: 'core' })
@Index(
  'IDX_WHATSAPP_AGENT_CONVERSATION_AGENT_ID_CONTACT_PHONE_NUMBER',
  ['whatsappAgentId', 'contactPhoneNumber'],
  { unique: true },
)
export class WhatsappAgentConversationEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  whatsappAgentId: string;

  @ManyToOne(() => WhatsappAgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'whatsappAgentId' })
  whatsappAgent: Relation<WhatsappAgentEntity>;

  // E.164, the other party's number.
  @Column({ type: 'varchar', nullable: false })
  contactPhoneNumber: string;

  // Flipped to false either by the model itself reporting
  // wantsHumanHandoff, or by a human agent taking over the conversation from
  // the CRM — once false, WhatsappAgentResponderService stops replying to
  // this contact until a human flips it back on.
  @Column({ type: 'boolean', nullable: false, default: true })
  isAiEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  qualificationSummary: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
