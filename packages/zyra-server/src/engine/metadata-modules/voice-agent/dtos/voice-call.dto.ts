import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { VoiceCallDirection } from 'src/engine/metadata-modules/voice-agent/types/voice-call-direction.enum';
import { VoiceCallStatus } from 'src/engine/metadata-modules/voice-agent/types/voice-call-status.enum';

@ObjectType('VoiceCall')
export class VoiceCallDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  voiceAgentId: string;

  // Twilio's own call id — exposed read-only for support/debugging
  // (matching against Twilio console logs), never accepted as input.
  @IsString()
  @IsNotEmpty()
  @Field()
  twilioCallSid: string;

  @Field(() => VoiceCallDirection)
  direction: VoiceCallDirection;

  @Field(() => VoiceCallStatus)
  status: VoiceCallStatus;

  @IsString()
  @IsNotEmpty()
  @Field()
  fromNumber: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  toNumber: string;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  startedAt: Date | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  endedAt: Date | null;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  durationSeconds: number | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  transcript: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  summary: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  recordingUrl: string | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
