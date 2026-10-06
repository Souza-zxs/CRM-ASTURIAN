import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PlanLimitUsage')
export class PlanLimitUsageDTO {
  // String, not the PlanLimitKey TS union — keeping this DTO's field a
  // plain string avoids having to register yet another GraphQL enum just
  // for a dashboard display key; the frontend matches on the literal value.
  @Field(() => String)
  key: string;

  @Field(() => Int)
  used: number;

  @Field(() => Int)
  limit: number;
}
