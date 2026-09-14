import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WhatsappAgentConversation')
export class WhatsappAgentConversationDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  whatsappAgentId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  contactPhoneNumber: string;

  @IsBoolean()
  @Field()
  isAiEnabled: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  qualificationSummary: string | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  lastMessageAt: Date | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;
}
