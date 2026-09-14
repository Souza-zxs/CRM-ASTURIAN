import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateInstagramAutomationRuleInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  replyMessage?: string;

  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  publicReplyVariations?: string[];

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  requiresFollowToReceiveDm?: boolean;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  followUpMessage?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Field(() => Number, { nullable: true })
  followUpDelayMinutes?: number;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;
}
