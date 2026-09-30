import { createHmac } from 'crypto';

import { KiwifyPaymentAdapter } from 'src/modules/payments/adapters/kiwify-payment-adapter';

const SECRET = 'my-webhook-token';

const PURCHASE_BODY = {
  id: 'order-abc-123',
  webhook_event_type: 'compra_aprovada',
  order_status: 'paid',
  customer: {
    name: 'Maria Silva',
    email: 'maria@example.com',
    mobile: '5511999999999',
  },
  product: { id: 'prod-1', name: 'Workshop Zyra' },
  payment: { charge_amount: 49700, charge_currency: 'BRL' },
  approved_date: '2026-09-28T10:00:00Z',
};

const buildRequest = (body: unknown, secret = SECRET) => {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = createHmac('sha1', secret).update(rawBody).digest('hex');

  return { rawBody, headers: {}, query: { signature } };
};

describe('KiwifyPaymentAdapter', () => {
  const adapter = new KiwifyPaymentAdapter();

  describe('verifySignature', () => {
    it('accepts a valid HMAC-SHA1 signature in the query string', () => {
      const request = buildRequest(PURCHASE_BODY);

      expect(adapter.verifySignature(request, SECRET)).toBe(true);
    });

    it('rejects a signature computed with the wrong secret', () => {
      const request = buildRequest(PURCHASE_BODY, 'wrong-token');

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });

    it('rejects a missing signature query param', () => {
      const request = {
        rawBody: Buffer.from(JSON.stringify(PURCHASE_BODY)),
        headers: {},
        query: {},
      };

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('normalizes an approved purchase', () => {
      const request = buildRequest(PURCHASE_BODY);

      expect(adapter.normalize(request)).toEqual({
        type: 'purchase',
        externalId: 'order-abc-123',
        buyer: {
          email: 'maria@example.com',
          phone: '5511999999999',
          name: 'Maria Silva',
        },
        product: { name: 'Workshop Zyra', id: 'prod-1' },
        amount: { value: 497, currency: 'BRL' },
        occurredAt: new Date('2026-09-28T10:00:00Z'),
      });
    });

    it('normalizes a refund by event name', () => {
      const request = buildRequest({
        ...PURCHASE_BODY,
        webhook_event_type: 'compra_reembolsada',
        order_status: 'refunded',
      });

      expect(adapter.normalize(request)?.type).toBe('refund');
    });

    it('normalizes a refund by status value alone, when only order_status is present', () => {
      const { webhook_event_type: _ignored, ...bodyWithoutEventName } =
        PURCHASE_BODY;
      const request = buildRequest({
        ...bodyWithoutEventName,
        order_status: 'chargedback',
      });

      expect(adapter.normalize(request)?.type).toBe('refund');
    });

    it('returns null for an event type this integration ignores', () => {
      const request = buildRequest({
        ...PURCHASE_BODY,
        webhook_event_type: 'boleto_gerado',
        order_status: 'pending',
      });

      expect(adapter.normalize(request)).toBeNull();
    });

    it('returns null for malformed JSON', () => {
      const request = {
        rawBody: Buffer.from('not json'),
        headers: {},
        query: {},
      };

      expect(adapter.normalize(request)).toBeNull();
    });
  });
});
