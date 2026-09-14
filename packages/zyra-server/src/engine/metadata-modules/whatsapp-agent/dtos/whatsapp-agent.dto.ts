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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WhatsappAgent')
export class WhatsappAgentDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  whatsappChannelId: string;

  @IsBoolean()
  @Field()
  isActive: boolean;

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
  @IsNotEmpty()
  @Field()
  model: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
