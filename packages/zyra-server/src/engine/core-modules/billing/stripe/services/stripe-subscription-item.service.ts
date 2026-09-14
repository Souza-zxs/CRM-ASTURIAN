/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class StripeSubscriptionItemService {
  protected readonly logger = new Logger(StripeSubscriptionItemService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.zyraConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.zyraConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async updateSubscriptionItem(
    stripeItemId: string,
    updateData: Stripe.SubscriptionItemUpdateParams,
  ) {
    await this.stripe.subscriptionItems.update(stripeItemId, updateData);
  }

  async createSubscriptionItem(
    stripeSubscriptionId: string,
    stripePriceId: string,
    quantity?: number,
  ) {
    return this.stripe.subscriptionItems.create({
      subscription: stripeSubscriptionId,
      price: stripePriceId,
      ...(isDefined(quantity) ? { quantity } : {}),
    });
  }

  async deleteSubscriptionItem(stripeItemId: string, clearUsage = false) {
    return this.stripe.subscriptionItems.del(stripeItemId, {
      clear_usage: clearUsage,
    });
  }
}
