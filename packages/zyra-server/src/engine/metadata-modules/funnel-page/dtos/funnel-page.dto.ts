import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  type FunnelPageContent,
  FunnelPageStatus,
  FunnelPageType,
} from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FunnelPage')
export class FunnelPageDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsEnum(FunnelPageType)
  @IsNotEmpty()
  @Field(() => FunnelPageType)
  type: FunnelPageType;

  @IsString()
  @IsNotEmpty()
  @Field()
  slug: string;

  @IsEnum(FunnelPageStatus)
  @IsNotEmpty()
  @Field(() => FunnelPageStatus)
  status: FunnelPageStatus;

  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  content: FunnelPageContent;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoTitle: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoDescription: string | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
