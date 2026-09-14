import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('InstagramAutomationRule')
export class InstagramAutomationRuleDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  instagramChannelId: string;

  @IsString()
  @Field(() => String, { nullable: true })
  name: string | null;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaId: string | null;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaCaption: string | null;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaThumbnailUrl: string | null;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaPermalink: string | null;

  @IsString({ each: true })
  @Field(() => [String])
  keywords: string[];

  @IsString()
  @IsNotEmpty()
  @Field()
  replyMessage: string;

  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  publicReplyVariations: string[] | null;

  @IsBoolean()
  @Field()
  requiresFollowToReceiveDm: boolean;

  @IsString()
  @Field(() => String, { nullable: true })
  followUpMessage: string | null;

  @IsInt()
  @Field(() => Number, { nullable: true })
  followUpDelayMinutes: number | null;

  @IsBoolean()
  @Field()
  attachToNextReel: boolean;

  @IsBoolean()
  @Field()
  isActive: boolean;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
