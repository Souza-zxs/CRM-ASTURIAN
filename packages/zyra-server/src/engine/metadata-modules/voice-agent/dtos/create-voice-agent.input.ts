import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { type VoiceAgentWeeklyAvailability } from 'src/engine/metadata-modules/voice-agent/types/weekly-availability.type';

@InputType()
export class CreateVoiceAgentInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  systemPrompt: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  voice?: string;

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
