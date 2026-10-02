import { Injectable } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

// Mirrors the set the existing unique index on BillingSubscriptionEntity
// already treats as "has a live paid plan" (see billing-subscription.entity.ts).
const ACTIVE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.Trialing,
  SubscriptionStatus.Active,
  SubscriptionStatus.PastDue,
];

@Injectable()
export class WorkspacePlanTierService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectWorkspaceScopedRepository(WorkspacePlanGrandfatherEntity)
    private readonly grandfatherRepository: WorkspaceScopedRepository<WorkspacePlanGrandfatherEntity>,
  ) {}

  async getWorkspacePlanTier(workspaceId: string): Promise<WorkspacePlanTier> {
    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    if (
      currentBillingSubscription !== NO_BILLING_SUBSCRIPTION &&
      ACTIVE_SUBSCRIPTION_STATUSES.includes(currentBillingSubscription.status)
    ) {
      return WorkspacePlanTier.PRO;
    }

    const grandfather = await this.grandfatherRepository.findOne(
      workspaceId,
      {},
    );

    return isDefined(grandfather)
      ? WorkspacePlanTier.PRO
      : WorkspacePlanTier.BASIC;
  }

  // All 5 gated features are PRO-only today, so this collapses to "is PRO" —
  // kept as its own method so a future per-feature matrix doesn't require
  // touching every guard call site.
  async hasAccessToFeature(
    workspaceId: string,
    _feature: PlanGatedFeature,
  ): Promise<boolean> {
    return (
      (await this.getWorkspacePlanTier(workspaceId)) === WorkspacePlanTier.PRO
    );
  }
}
