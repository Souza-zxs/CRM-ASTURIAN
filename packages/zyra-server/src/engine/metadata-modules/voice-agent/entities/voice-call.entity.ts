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

import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallDirection } from 'src/engine/metadata-modules/voice-agent/types/voice-call-direction.enum';
import { VoiceCallStatus } from 'src/engine/metadata-modules/voice-agent/types/voice-call-status.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(VoiceCallDirection, { name: 'VoiceCallDirection' });
registerEnumType(VoiceCallStatus, { name: 'VoiceCallStatus' });

// One phone call handled by a VoiceAgentEntity, start to finish. Created by
// the inbound Twilio webhook (status IN_PROGRESS, direction INBOUND — see
// voice-webhooks.controller.ts), then updated throughout the call by the
// media-stream bridge (transcript/summary, see voice-realtime-bridge.service.ts)
// and finalized either by Twilio's status callback or by the bridge itself
// when the media stream closes.
@Entity({ name: 'voiceCall', schema: 'core' })
@Index('IDX_VOICE_CALL_WORKSPACE_ID_VOICE_AGENT_ID', [
  'workspaceId',
  'voiceAgentId',
])
export class VoiceCallEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  voiceAgentId: string;

  @ManyToOne(() => VoiceAgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voiceAgentId' })
  voiceAgent: Relation<VoiceAgentEntity>;

  @Column({ type: 'varchar', nullable: false, unique: true })
  twilioCallSid: string;

  @Column({ type: 'enum', enum: VoiceCallDirection, nullable: false })
  direction: VoiceCallDirection;

  @Column({
    type: 'enum',
    enum: VoiceCallStatus,
    nullable: false,
    default: VoiceCallStatus.IN_PROGRESS,
  })
  status: VoiceCallStatus;

  @Column({ type: 'varchar', nullable: false })
  fromNumber: string;

  @Column({ type: 'varchar', nullable: false })
  toNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  // Accumulated during the call by the media-stream bridge from the Realtime
  // API's response.audio_transcript.delta events — best-effort, saved
  // periodically and on close, not guaranteed complete if the process crashes
  // mid-call.
  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  // Short qualification/outcome summary generated at the end of the call.
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'varchar', nullable: true })
  recordingUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
