import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { MessageChannelSyncStatus } from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('InstagramChannel')
export class InstagramChannelDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @HideField()
  messageChannelId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  igBusinessAccountId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  username: string;

  @IsString()
  @Field(() => String, { nullable: true })
  profilePictureUrl: string | null;

  @IsBoolean()
  @Field()
  isSyncEnabled: boolean;

  @IsEnum(MessageChannelSyncStatus)
  @IsNotEmpty()
  @Field(() => MessageChannelSyncStatus)
  syncStatus: MessageChannelSyncStatus;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
