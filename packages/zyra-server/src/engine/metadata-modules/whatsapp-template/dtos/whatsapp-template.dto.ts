import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  WhatsappTemplateCategory,
  type WhatsappTemplateButton,
  WhatsappTemplateStatus,
} from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WhatsappTemplate')
export class WhatsappTemplateDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  whatsappChannelId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsEnum(WhatsappTemplateCategory)
  @IsNotEmpty()
  @Field(() => WhatsappTemplateCategory)
  category: WhatsappTemplateCategory;

  @IsString()
  @IsNotEmpty()
  @Field()
  language: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  headerText: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  bodyText: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  footerText: string | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  buttons: WhatsappTemplateButton[] | null;

  @IsEnum(WhatsappTemplateStatus)
  @IsNotEmpty()
  @Field(() => WhatsappTemplateStatus)
  status: WhatsappTemplateStatus;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  metaTemplateId: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  metaTemplateStatus: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  rejectionReason: string | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
