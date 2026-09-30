import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import Stripe from 'stripe';
import { isDefined } from 'zyra-shared/utils';

import {
  type PaymentProviderAdapter,
  type PaymentWebhookRequest,
} from 'src/modules/payments/adapters/payment-provider-adapter.interface';
import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

const SIGNATURE_HEADER = 'stripe-signature';

// stripe.webhooks.constructEvent only performs local HMAC verification
// against the endpoint secret — it never calls the Stripe API, so the SDK
// instance below doesn't need a real API key (each workspace configures its
// own webhook signing secret, not an API key, in Settings).
const stripe = new Stripe('sk_not_used_for_webhook_verification');

@Injectable()
export class StripePaymentAdapter implements PaymentProviderAdapter {
  private readonly logger = new Logger(StripePaymentAdapter.name);

  verifySignature(request: PaymentWebhookRequest, secret: string): boolean {
    const signature = request.headers[SIGNATURE_HEADER];

    if (!isNonEmptyString(signature)) {
      return false;
    }

    try {
      stripe.webhooks.constructEvent(request.rawBody, signature, secret);

      return true;
    } catch (error) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }

  normalize(request: PaymentWebhookRequest): NormalizedPaymentEvent | null {
    let event: Stripe.Event;

    try {
      event = JSON.parse(request.rawBody.toString('utf-8'));
    } catch {
      return null;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!isNonEmptyString(session.id)) {
        return null;
      }

      return {
        type: 'purchase',
        externalId: session.id,
        buyer: {
          email: session.customer_details?.email ?? session.customer_email ?? null,
          phone: session.customer_details?.phone ?? null,
          name: session.customer_details?.name ?? null,
        },
        product: {
          name: session.metadata?.productName ?? 'Stripe checkout',
          id: session.metadata?.productId ?? null,
        },
        amount: {
          value: isDefined(session.amount_total) ? session.amount_total / 100 : 0,
          currency: (session.currency ?? 'usd').toUpperCase(),
        },
        occurredAt: new Date(event.created * 1000),
      };
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;

      if (!isNonEmptyString(charge.id)) {
        return null;
      }

      return {
        type: 'refund',
        // Refunds a charge that belongs to the same checkout.session — the
        // payment_intent id ties this refund back to the original purchase
        // for platforms that don't share the session id directly.
        externalId: isNonEmptyString(charge.payment_intent as string)
          ? (charge.payment_intent as string)
          : charge.id,
        buyer: {
          email: charge.billing_details?.email ?? null,
          phone: charge.billing_details?.phone ?? null,
          name: charge.billing_details?.name ?? null,
        },
        product: {
          name: charge.metadata?.productName ?? 'Stripe checkout',
          id: charge.metadata?.productId ?? null,
        },
        amount: {
          value: charge.amount_refunded / 100,
          currency: charge.currency.toUpperCase(),
        },
        occurredAt: new Date(event.created * 1000),
      };
    }

    return null;
  }
}
