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

@ObjectType('WhatsappChannel')
export class WhatsappChannelDTO {
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
  phoneNumberId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  wabaId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  displayPhoneNumber: string;

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
