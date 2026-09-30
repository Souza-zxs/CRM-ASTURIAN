import { HotmartPaymentAdapter } from 'src/modules/payments/adapters/hotmart-payment-adapter';

const SECRET = 'my-account-hottok';

const buildRequest = (body: unknown, hottok = SECRET) => ({
  rawBody: Buffer.from(JSON.stringify(body)),
  headers: { 'x-hotmart-hottok': hottok },
  query: {},
});

const PURCHASE_APPROVED_BODY = {
  id: '1234567890123456789',
  creation_date: 12345678,
  event: 'PURCHASE_APPROVED',
  version: '2.0.0',
  data: {
    product: {
      id: 213344,
      ucode: '2e9c43a9-0aeb-48ed-9464-630f845c23af',
      name: 'Workshop Zyra',
    },
    buyer: {
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '5511999999999',
    },
    purchase: {
      transaction: 'HP12455690122399',
      order_date: 1622948400000,
      approved_date: 1622948400000,
      price: { value: 497, currency_value: 'BRL' },
      status: 'APPROVED',
    },
  },
};

const PURCHASE_REFUNDED_BODY = {
  ...PURCHASE_APPROVED_BODY,
  event: 'PURCHASE_REFUNDED',
};

describe('HotmartPaymentAdapter', () => {
  const adapter = new HotmartPaymentAdapter();

  describe('verifySignature', () => {
    it('accepts a matching hottok', () => {
      const request = buildRequest(PURCHASE_APPROVED_BODY);

      expect(adapter.verifySignature(request, SECRET)).toBe(true);
    });

    it('rejects a wrong hottok', () => {
      const request = buildRequest(PURCHASE_APPROVED_BODY, 'wrong-token');

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });

    it('rejects a missing hottok header', () => {
      const request = {
        rawBody: Buffer.from(JSON.stringify(PURCHASE_APPROVED_BODY)),
        headers: {},
        query: {},
      };

      expect(adapter.verifySignature(request, SECRET)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('normalizes a PURCHASE_APPROVED event', () => {
      const request = buildRequest(PURCHASE_APPROVED_BODY);

      expect(adapter.normalize(request)).toEqual({
        type: 'purchase',
        externalId: 'HP12455690122399',
        buyer: {
          email: 'maria@example.com',
          phone: '5511999999999',
          name: 'Maria Silva',
        },
        product: { name: 'Workshop Zyra', id: '213344' },
        amount: { value: 497, currency: 'BRL' },
        occurredAt: new Date(1622948400000),
      });
    });

    it('normalizes a PURCHASE_REFUNDED event as a refund', () => {
      const request = buildRequest(PURCHASE_REFUNDED_BODY);

      expect(adapter.normalize(request)?.type).toBe('refund');
      expect(adapter.normalize(request)?.externalId).toBe(
        'HP12455690122399',
      );
    });

    it('returns null for an event type this integration ignores', () => {
      const request = buildRequest({
        ...PURCHASE_APPROVED_BODY,
        event: 'PURCHASE_BILLET_PRINTED',
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
