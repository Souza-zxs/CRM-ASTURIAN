import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type VoiceAgentWeeklyAvailability } from 'src/engine/metadata-modules/voice-agent/types/weekly-availability.type';

@ObjectType('VoiceAgent')
export class VoiceAgentDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsBoolean()
  @Field()
  isActive: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phoneNumber: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  voice: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  systemPrompt: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  greetingMessage: string | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  forbiddenPhrases: string[] | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  qualificationCriteria: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  handoffInstructions: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  transferPhoneNumber: string | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  weeklyAvailability: VoiceAgentWeeklyAvailability | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
