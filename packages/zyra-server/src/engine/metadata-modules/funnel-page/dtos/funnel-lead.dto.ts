import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FunnelLead')
export class FunnelLeadDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

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
  utmSource: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  utmMedium: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  utmCampaign: string | null;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;
}
