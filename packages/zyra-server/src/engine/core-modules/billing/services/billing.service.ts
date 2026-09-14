/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingProductService: BillingProductService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
  ) {}

  isBillingEnabled() {
    return this.zyraConfigService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceAnySubscription(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      { where: {} },
    );

    return isDefined(subscription);
  }

  async hasEntitlement(
    workspaceId: string,
    entitlementKey: BillingEntitlementKey,
  ) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    return this.billingSubscriptionService.getWorkspaceEntitlementByKey(
      workspaceId,
      entitlementKey,
    );
  }

  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    const hasAnySubscription =
      await this.hasWorkspaceAnySubscription(workspaceId);

    return !hasAnySubscription;
  }
}
