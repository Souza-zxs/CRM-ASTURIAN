import Stripe from 'stripe';

import { StripePaymentAdapter } from 'src/modules/payments/adapters/stripe-payment-adapter';

const SECRET = 'whsec_test_secret';
const stripe = new Stripe('sk_test_not_used');

const CHECKOUT_SESSION_COMPLETED_EVENT = {
  id: 'evt_1',
  object: 'event',
  type: 'checkout.session.completed',
  created: 1622948400,
  data: {
    object: {
      id: 'cs_test_123',
      object: 'checkout.session',
      amount_total: 49700,
      currency: 'brl',
      customer_details: {
        email: 'maria@example.com',
        phone: '+5511999999999',
        name: 'Maria Silva',
      },
      metadata: { productName: 'Workshop Zyra', productId: 'prod-1' },
    },
  },
};

const CHARGE_REFUNDED_EVENT = {
  id: 'evt_2',
  object: 'event',
  type: 'charge.refunded',
  created: 1622948500,
  data: {
    object: {
      id: 'ch_test_123',
      object: 'charge',
      amount_refunded: 49700,
      currency: 'brl',
      payment_intent: 'pi_test_123',
      billing_details: {
        email: 'maria@example.com',
        phone: '+5511999999999',
        name: 'Maria Silva',
      },
      metadata: { productName: 'Workshop Zyra', productId: 'prod-1' },
    },
  },
};

const buildRequest = (event: unknown, secret = SECRET) => {
  const rawBody = Buffer.from(JSON.stringify(event));
  const header = stripe.webhooks.generateTestHeaderString({
    payload: rawBody.toString('utf-8'),
    secret,
  });

  return { rawBody, headers: { 'stripe-signature': header }, query: {} };
};

describe('StripePaymentAdapter', () => {
  const adapter = new StripePaymentAdapter();

  describe('verifySignature', () => {
    it('accepts a signature generated with the matching secret', () => {
      const request = buildRequest(CHECKOUT_SESSION_COMPLETED_EVENT);

      expect(adapter.verifySignature(request, SECRET)).toBe(true);
    });

    it('rejects a signature generated with the wrong secret', () => {
      const request = buildRequest(
        CHECKOUT_SESSION_COMPLETED_EVENT,
        'whsec_other_secret',
      );

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });

    it('rejects a missing stripe-signature header', () => {
      const request = {
        rawBody: Buffer.from(JSON.stringify(CHECKOUT_SESSION_COMPLETED_EVENT)),
        headers: {},
        query: {},
      };

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('normalizes checkout.session.completed as a purchase', () => {
      const request = buildRequest(CHECKOUT_SESSION_COMPLETED_EVENT);

      expect(adapter.normalize(request)).toEqual({
        type: 'purchase',
        externalId: 'cs_test_123',
        buyer: {
          email: 'maria@example.com',
          phone: '+5511999999999',
          name: 'Maria Silva',
        },
        product: { name: 'Workshop Zyra', id: 'prod-1' },
        amount: { value: 497, currency: 'BRL' },
        occurredAt: new Date(1622948400 * 1000),
      });
    });

    it('normalizes charge.refunded as a refund keyed by the payment intent id', () => {
      const request = buildRequest(CHARGE_REFUNDED_EVENT);

      expect(adapter.normalize(request)).toEqual({
        type: 'refund',
        externalId: 'pi_test_123',
        buyer: {
          email: 'maria@example.com',
          phone: '+5511999999999',
          name: 'Maria Silva',
        },
        product: { name: 'Workshop Zyra', id: 'prod-1' },
        amount: { value: 497, currency: 'BRL' },
        occurredAt: new Date(1622948500 * 1000),
      });
    });

    it('returns null for an event type this integration ignores', () => {
      const request = buildRequest({
        ...CHECKOUT_SESSION_COMPLETED_EVENT,
        type: 'customer.created',
      });

      expect(adapter.normalize(request)).toBeNull();
    });
  });
});
