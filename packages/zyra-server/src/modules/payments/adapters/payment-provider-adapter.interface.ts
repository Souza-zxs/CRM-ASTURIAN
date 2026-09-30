import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

export type PaymentWebhookRequest = {
  rawBody: Buffer;
  headers: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
};

export interface PaymentProviderAdapter {
  // Verifies the webhook actually came from the platform, using the
  // workspace's configured secret. Must be constant-time where the
  // underlying primitive supports it (HMAC comparisons).
  verifySignature(
    request: PaymentWebhookRequest,
    secret: string,
  ): boolean;

  // Returns null for event types this integration doesn't act on (e.g. a
  // boleto/PIX-generated notification) — the controller treats that as a
  // deliberate no-op, not an error.
  normalize(request: PaymentWebhookRequest): NormalizedPaymentEvent | null;
}
