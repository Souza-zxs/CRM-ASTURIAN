import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type VoiceAgentWeeklyAvailability } from 'src/engine/metadata-modules/voice-agent/types/weekly-availability.type';

@InputType()
export class UpdateVoiceAgentInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  voice?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  greetingMessage?: string;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  forbiddenPhrases?: string[];

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  qualificationCriteria?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  handoffInstructions?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  transferPhoneNumber?: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  weeklyAvailability?: VoiceAgentWeeklyAvailability;
}
