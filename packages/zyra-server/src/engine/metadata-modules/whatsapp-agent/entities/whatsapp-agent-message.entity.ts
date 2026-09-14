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
} from 'typeorm';

import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentMessageDirection } from 'src/engine/metadata-modules/whatsapp-agent/types/whatsapp-agent-message-direction.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(WhatsappAgentMessageDirection, {
  name: 'WhatsappAgentMessageDirection',
});

// Short message history for a WhatsappAgentConversationEntity — read back
// (last ~20) purely to give the model context for its next reply. Not the
// CRM inbox: that history already exists in Message/Thread/Participant via
// the normal WhatsApp channel import, this table only exists to be cheap and
// self-contained to query from the responder job.
@Entity({ name: 'whatsappAgentMessage', schema: 'core' })
@Index('IDX_WHATSAPP_AGENT_MESSAGE_CONVERSATION_ID_CREATED_AT', [
  'conversationId',
  'createdAt',
])
export class WhatsappAgentMessageEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  conversationId: string;

  @ManyToOne(() => WhatsappAgentConversationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Relation<WhatsappAgentConversationEntity>;

  @Column({
    type: 'enum',
    enum: WhatsappAgentMessageDirection,
    nullable: false,
  })
  direction: WhatsappAgentMessageDirection;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
