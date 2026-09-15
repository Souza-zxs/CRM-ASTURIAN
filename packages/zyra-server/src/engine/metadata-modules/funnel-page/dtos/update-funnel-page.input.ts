import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type FunnelPageContent, FunnelPageType } from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateFunnelPageInput {
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @Field(() => FunnelPageType, { nullable: true })
  type?: FunnelPageType;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field(() => String, { nullable: true })
  slug?: string;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  content?: FunnelPageContent;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoTitle?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoDescription?: string;
}
