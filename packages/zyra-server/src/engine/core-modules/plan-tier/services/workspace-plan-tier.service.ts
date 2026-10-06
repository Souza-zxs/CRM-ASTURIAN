import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { MODULE_CATALOG } from 'src/engine/core-modules/plan-tier/constants/module-catalog.constant';
import { MODULE_PRODUCT_KEY_BY_FEATURE } from 'src/engine/core-modules/plan-tier/constants/module-product-key-by-feature.constant';
import { WorkspaceModuleEntitlementDTO } from 'src/engine/core-modules/plan-tier/dtos/workspace-module-entitlement.dto';
import { WorkspaceModuleGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-module-grandfather.entity';
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
    @InjectWorkspaceScopedRepository(WorkspaceModuleGrandfatherEntity)
    private readonly moduleGrandfatherRepository: WorkspaceScopedRepository<WorkspaceModuleGrandfatherEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
  ) {}

  // "PRO" here means "has an active base subscription" — there are no tiers
  // any more (2026-10-03 à-la-carte module redesign), this boolean-as-enum
  // just gates whether the workspace exists commercially at all. Left
  // unrenamed on purpose: WorkspaceResolver#planTier and the frontend's
  // useWorkspacePlanTier() already depend on this exact shape and it still
  // means exactly what it always meant.
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

    const hasAnyGrandfatheredModule = await this.moduleGrandfatherRepository
      .find(workspaceId, {})
      .then((rows) => rows.length > 0);

    return hasAnyGrandfatheredModule
      ? WorkspacePlanTier.PRO
      : WorkspacePlanTier.BASIC;
  }

  // A workspace has access to a module only if it (a) has an active base
  // subscription at all, AND (b) has that specific module contracted —
  // either via a grandfather row (legacy/manual grant) or a live Stripe
  // subscription item for that module's product. Quantity > 0 is the
  // binary "has it" signal for every module, quantifiable or not.
  async hasAccessToFeature(
    workspaceId: string,
    feature: PlanGatedFeature,
  ): Promise<boolean> {
    const planTier = await this.getWorkspacePlanTier(workspaceId);

    if (planTier !== WorkspacePlanTier.PRO) {
      return false;
    }

    return (await this.getModuleQuantity(workspaceId, feature)) > 0;
  }

  async getModuleQuantity(
    workspaceId: string,
    module: PlanGatedFeature,
  ): Promise<number> {
    const grandfather = await this.moduleGrandfatherRepository.findOne(
      workspaceId,
      { where: { module } },
    );

    if (isDefined(grandfather)) {
      return 1;
    }

    const productKey = MODULE_PRODUCT_KEY_BY_FEATURE[module];

    return this.getSubscriptionItemQuantity(workspaceId, productKey);
  }

  async hasModule(
    workspaceId: string,
    module: PlanGatedFeature,
  ): Promise<boolean> {
    return (await this.getModuleQuantity(workspaceId, module)) > 0;
  }

  // Powers the module store / entitlements list on the frontend. Returns
  // every module in the catalog (including the reserved-but-unbuilt ones)
  // so the UI can show what's sellable even before quantity > 0.
  async listModuleEntitlements(
    workspaceId: string,
  ): Promise<WorkspaceModuleEntitlementDTO[]> {
    const planTier = await this.getWorkspacePlanTier(workspaceId);

    return Promise.all(
      Object.values(PlanGatedFeature).map(async (module) => {
        const quantity =
          planTier === WorkspacePlanTier.PRO
            ? await this.getModuleQuantity(workspaceId, module)
            : 0;

        return {
          module,
          quantity,
          hasAccess: quantity > 0,
          implemented: MODULE_CATALOG[module].implemented,
        };
      }),
    );
  }

  // Idempotent (unique constraint on workspaceId+module) — safe to call
  // from a backfill/migration that might run more than once. Used by
  // upgrade commands to grant legacy/real-usage-based access; application
  // code should not call this directly to "give" a module, only billing
  // webhooks and migrations have a legitimate reason to write a grandfather
  // row.
  async grantModuleIfMissing(
    workspaceId: string,
    module: PlanGatedFeature,
    reason: string,
  ): Promise<void> {
    const existing = await this.moduleGrandfatherRepository.findOne(
      workspaceId,
      { where: { module } },
    );

    if (isDefined(existing)) {
      return;
    }

    await this.moduleGrandfatherRepository.save(workspaceId, {
      module,
      reason,
    });
  }

  // Sums quantity across the workspace's active-subscription line items for
  // this module's product. Returns 0 (not an error) when no Stripe product
  // with this key exists yet — expected until the operational step of
  // creating the real module products in Stripe is done; see
  // docs/superpowers/specs/2026-10-03-saas-plan-tiers-design.md.
  private async getSubscriptionItemQuantity(
    workspaceId: string,
    productKey: BillingProductKey,
  ): Promise<number> {
    const items = await this.billingSubscriptionItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.billingSubscription', 'subscription')
      .innerJoin('item.billingProduct', 'product')
      .where('subscription.workspaceId = :workspaceId', { workspaceId })
      .andWhere('subscription.status IN (:...statuses)', {
        statuses: ACTIVE_SUBSCRIPTION_STATUSES,
      })
      .andWhere("product.metadata->>'productKey' = :productKey", {
        productKey,
      })
      .getMany();

    return items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  }
}
