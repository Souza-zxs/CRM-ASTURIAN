import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  WhatsappTemplateCategory,
  type WhatsappTemplateButton,
} from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWhatsappTemplateInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => WhatsappTemplateCategory, { nullable: true })
  @IsEnum(WhatsappTemplateCategory)
  @IsOptional()
  category?: WhatsappTemplateCategory;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  language?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  headerText?: string | null;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  footerText?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  buttons?: WhatsappTemplateButton[] | null;
}
