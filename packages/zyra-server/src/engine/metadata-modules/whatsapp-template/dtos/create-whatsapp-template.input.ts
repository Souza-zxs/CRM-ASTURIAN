import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  WhatsappTemplateCategory,
  type WhatsappTemplateButton,
} from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateWhatsappTemplateInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  whatsappChannelId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => WhatsappTemplateCategory)
  @IsEnum(WhatsappTemplateCategory)
  category: WhatsappTemplateCategory;

  @Field()
  @IsString()
  @IsNotEmpty()
  language: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  headerText?: string | null;

  @Field()
  @IsString()
  @IsNotEmpty()
  bodyText: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  footerText?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  buttons?: WhatsappTemplateButton[] | null;
}
