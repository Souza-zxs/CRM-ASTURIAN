export type NormalizedPaymentEventType = 'purchase' | 'refund';

export type NormalizedPaymentEvent = {
  type: NormalizedPaymentEventType;
  // The platform's own transaction/order id — the idempotency key together
  // with `type` (see PaymentWebhookEventLogEntity).
  externalId: string;
  buyer: {
    email: string | null;
    phone: string | null;
    name: string | null;
  };
  product: {
    name: string;
    id: string | null;
  };
  amount: {
    // Major currency units (e.g. reais, not cents) — each adapter is
    // responsible for converting from whatever unit its platform uses.
    value: number;
    currency: string;
  };
  occurredAt: Date;
};
