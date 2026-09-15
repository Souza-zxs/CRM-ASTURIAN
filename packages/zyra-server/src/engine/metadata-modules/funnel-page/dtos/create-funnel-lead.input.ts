import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateFunnelLeadInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  funnelPageId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  whatsapp: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  utmSource?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  utmMedium?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  utmCampaign?: string;
}
