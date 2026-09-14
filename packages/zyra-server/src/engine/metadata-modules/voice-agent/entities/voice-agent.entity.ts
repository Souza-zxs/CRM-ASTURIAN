import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type VoiceAgentWeeklyAvailability } from 'src/engine/metadata-modules/voice-agent/types/weekly-availability.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// A phone-answering AI voice agent: one Twilio number bridged to the OpenAI
// Realtime API for speech-to-speech conversation. Deliberately independent
// from the native "AI Agents" system (AgentEntity / flat-agent, under
// src/engine/metadata-modules/ai/), whose schema-sync machinery
// (SyncableEntity/universal-flat-entity) is not a fit for a plain,
// workspace-owned CRUD resource like this one — same reasoning that keeps
// WhatsappChannelEntity/InstagramChannelEntity out of that system too.
@Entity({ name: 'voiceAgent', schema: 'core' })
export class VoiceAgentEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Internal name shown in the settings list (e.g. "Recepcionista de vendas") —
  // never spoken by the agent itself.
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  // E.164. Globally unique — inbound Twilio webhooks route purely by the
  // dialed number (Twilio has no concept of "workspace" on the call payload),
  // same rationale as WhatsappChannelEntity.phoneNumberId's uniqueness.
  @Column({ type: 'varchar', nullable: true, unique: true })
  phoneNumber: string | null;

  // OpenAI Realtime API voice id (e.g. "alloy", "verse"). Kept as a free
  // string rather than an enum — OpenAI adds/renames voices without notice,
  // and gating this behind a TypeScript enum would mean a deploy just to
  // unlock a new one.
  @Column({ type: 'varchar', nullable: false, default: 'alloy' })
  voice: string;

  // Core persona/instructions for the agent, in the workspace's language.
  // Combined with the other fields below by
  // voice-agent-instructions-builder.service.ts into the final Realtime API
  // system prompt — never sent to OpenAI on its own.
  @Column({ type: 'text', nullable: false })
  systemPrompt: string;

  // What the agent says the moment it picks up, before the caller speaks.
  @Column({ type: 'text', nullable: true })
  greetingMessage: string | null;

  // Words/phrases the agent must never say (compliance, brand voice). Stored
  // as simple-array like InstagramAutomationRuleEntity.keywords — short list,
  // never queried individually, only ever read back whole into the prompt.
  @Column({ type: 'simple-array', nullable: true })
  forbiddenPhrases: string[] | null;

  // What the agent should treat as a "qualified lead" on this call — folded
  // into the prompt so the model knows what to listen for and what to put in
  // VoiceCallEntity.summary at the end.
  @Column({ type: 'text', nullable: true })
  qualificationCriteria: string | null;

  // When/how the agent should tell the caller it's transferring them to a
  // human, before actually doing so via transferPhoneNumber.
  @Column({ type: 'text', nullable: true })
  handoffInstructions: string | null;

  // E.164 — destination of the <Dial> TwiML verb when the agent hands off to
  // a human. Null means this agent never transfers.
  @Column({ type: 'varchar', nullable: true })
  transferPhoneNumber: string | null;

  // Free-form weekly schedule, see VoiceAgentWeeklyAvailability. Read by the
  // availability tool exposed to the Realtime API session, not enforced
  // server-side.
  @Column({ type: 'jsonb', nullable: true })
  weeklyAvailability: VoiceAgentWeeklyAvailability | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
