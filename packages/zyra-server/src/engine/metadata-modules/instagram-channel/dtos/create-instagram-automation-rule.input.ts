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
export class CreateInstagramAutomationRuleInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  instagramChannelId: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  // Required unless attachToNextReel is true, in which case the media is
  // filled in later by InstagramAttachNextReelCronJob — validated in the
  // resolver rather than here, since the requirement is conditional on
  // another field.
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  igMediaId?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaCaption?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaThumbnailUrl?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  igMediaPermalink?: string;

  @IsString({ each: true })
  @Field(() => [String])
  keywords: string[];

  @IsString()
  @IsNotEmpty()
  @Field()
  replyMessage: string;

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
  attachToNextReel?: boolean;
}
