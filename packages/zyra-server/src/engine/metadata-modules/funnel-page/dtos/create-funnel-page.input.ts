import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type FunnelPageContent, FunnelPageType } from 'zyra-shared/types';

@InputType()
export class CreateFunnelPageInput {
  @Field(() => FunnelPageType)
  type: FunnelPageType;

  @IsString()
  @IsNotEmpty()
  @Field()
  slug: string;

  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  content: FunnelPageContent;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoTitle?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  seoDescription?: string;
}
