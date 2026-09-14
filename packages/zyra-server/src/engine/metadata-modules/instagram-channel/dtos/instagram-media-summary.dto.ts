import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('InstagramMediaSummary')
export class InstagramMediaSummaryDTO {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  caption: string | null;

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field()
  permalink: string;
}
