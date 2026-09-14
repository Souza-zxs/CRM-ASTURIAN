import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateWhatsappAgentInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  whatsappChannelId: string;

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
