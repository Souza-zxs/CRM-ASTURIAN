import { ForbiddenException } from '@nestjs/common';

import { PlanLimitKey } from 'src/engine/core-modules/plan-tier/constants/module-catalog.constant';

export class PlanLimitExceededException extends ForbiddenException {
  constructor(
    public readonly limitKey: PlanLimitKey,
    public readonly currentUsage: number,
    public readonly limit: number,
  ) {
    super(
      limit === 0
        ? `This feature requires an additional module to be contracted (limit key: "${limitKey}").`
        : `Plan limit reached for "${limitKey}": ${currentUsage}/${limit}. Contract an additional module to raise this limit.`,
    );
  }
}
