/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

@Injectable()
@WorkspaceCache('currentBillingSubscription')
export class WorkspaceCurrentBillingSubscriptionCacheService extends WorkspaceCacheProvider<CurrentBillingSubscription> {
  private readonly logger = new Logger(
    WorkspaceCurrentBillingSubscriptionCacheService.name,
  );

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<CurrentBillingSubscription> {
    let subscription;

    try {
      subscription =
        await this.billingSubscriptionService.getCurrentBillingSubscription({
          workspaceId,
        });
    } catch (error) {
      // Billing lookup must never block login/workspace loading — a
      // workspace with no usable billing subscription data should just
      // read as "no subscription", not take down the whole currentWorkspace
      // response.
      this.logger.error(
        `Failed to resolve current billing subscription for workspace ${workspaceId}, falling back to NO_BILLING_SUBSCRIPTION`,
        error,
      );

      return NO_BILLING_SUBSCRIPTION;
    }

    if (!isDefined(subscription)) {
      return NO_BILLING_SUBSCRIPTION;
    }

    return {
      id: subscription.id,
      workspaceId: subscription.workspaceId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      interval: subscription.interval,
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelAt: subscription.cancelAt,
      canceledAt: subscription.canceledAt,
      endedAt: subscription.endedAt,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      collectionMethod: subscription.collectionMethod,
    };
  }
}
