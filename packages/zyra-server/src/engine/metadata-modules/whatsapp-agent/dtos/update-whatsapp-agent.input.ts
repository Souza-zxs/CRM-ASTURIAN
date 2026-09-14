import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWhatsappAgentInput {
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
  model?: string;
}
