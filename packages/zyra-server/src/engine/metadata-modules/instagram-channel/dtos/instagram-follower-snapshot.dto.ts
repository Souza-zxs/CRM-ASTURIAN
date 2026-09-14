import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { IsDateString, IsInt, IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('InstagramFollowerSnapshot')
export class InstagramFollowerSnapshotDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  instagramChannelId: string;

  @IsInt()
  @Field()
  followerCount: number;

  @IsDateString()
  @Field()
  capturedAt: Date;

  @HideField()
  workspaceId: string;
}
