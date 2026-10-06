import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';

@ObjectType('WorkspaceModuleEntitlement')
export class WorkspaceModuleEntitlementDTO {
  @Field(() => PlanGatedFeature)
  module: PlanGatedFeature;

  // 0 = not contracted. Quantifiable modules (e.g. WhatsApp) can be > 1;
  // binary modules (e.g. Row-Level Permissions) are always 0 or 1.
  @Field(() => Int)
  quantity: number;

  @Field(() => Boolean)
  hasAccess: boolean;

  // false for MANYCHAT_LIKE/INTEGRATIONS — reserved in the catalog but the
  // underlying feature doesn't exist yet. The frontend uses this to render
  // "coming soon" instead of a working unlock, even if quantity > 0.
  @Field(() => Boolean)
  implemented: boolean;
}
