import { createHmac } from 'crypto';

import { GenericPaymentAdapter } from 'src/modules/payments/adapters/generic-payment-adapter';

const SECRET = 'generic-webhook-secret';

const PURCHASE_BODY = {
  type: 'purchase',
  externalId: 'zap-run-123',
  buyer: { email: 'maria@example.com', phone: '5511999999999', name: 'Maria Silva' },
  product: { name: 'Workshop Zyra', id: 'prod-1' },
  amount: { value: 497, currency: 'BRL' },
  occurredAt: '2026-09-28T10:00:00Z',
};

const buildRequest = (body: unknown, secret = SECRET) => {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = createHmac('sha256', secret).update(rawBody).digest('hex');

  return { rawBody, headers: { 'x-webhook-signature': signature }, query: {} };
};

describe('GenericPaymentAdapter', () => {
  const adapter = new GenericPaymentAdapter();

  describe('verifySignature', () => {
    it('accepts a valid HMAC-SHA256 signature header', () => {
      const request = buildRequest(PURCHASE_BODY);

      expect(adapter.verifySignature(request, SECRET)).toBe(true);
    });

    it('rejects a signature computed with the wrong secret', () => {
      const request = buildRequest(PURCHASE_BODY, 'wrong-secret');

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });

    it('rejects a missing signature header', () => {
      const request = {
        rawBody: Buffer.from(JSON.stringify(PURCHASE_BODY)),
        headers: {},
        query: {},
      };

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('normalizes a well-formed purchase event', () => {
      const request = buildRequest(PURCHASE_BODY);

      expect(adapter.normalize(request)).toEqual({
        type: 'purchase',
        externalId: 'zap-run-123',
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

    it('normalizes a refund event', () => {
      const request = buildRequest({ ...PURCHASE_BODY, type: 'refund' });

      expect(adapter.normalize(request)?.type).toBe('refund');
    });

    it('returns null when a required field is missing', () => {
      const { externalId: _omitted, ...bodyWithoutExternalId } = PURCHASE_BODY;
      const request = buildRequest(bodyWithoutExternalId);

      expect(adapter.normalize(request)).toBeNull();
    });

    it('returns null for an unrecognized type value', () => {
      const request = buildRequest({ ...PURCHASE_BODY, type: 'subscription' });

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
