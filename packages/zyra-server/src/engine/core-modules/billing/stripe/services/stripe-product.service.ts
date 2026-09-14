/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class StripeProductService {
  protected readonly logger = new Logger(StripeProductService.name);
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

  async getAllProducts() {
    const products = await this.stripe.products.list({
      active: true,
      limit: 100,
    });

    return products.data;
  }
}
