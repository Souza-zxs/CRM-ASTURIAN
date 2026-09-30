import { Injectable } from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'zyra-shared/utils';

import {
  type PaymentProviderAdapter,
  type PaymentWebhookRequest,
} from 'src/modules/payments/adapters/payment-provider-adapter.interface';
import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

// Hotmart sends a static per-account token (not an HMAC) in the
// X-HOTMART-HOTTOK header — the secret configured in our Settings screen IS
// that hottok, copy-pasted from the product's Webhook settings in Hotmart.
const HOTTOK_HEADER = 'x-hotmart-hottok';

const PURCHASE_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const REFUND_EVENTS = new Set([
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_CANCELED',
]);

type HotmartWebhookBody = {
  event?: string;
  data?: {
    product?: { id?: number | string; name?: string };
    buyer?: { name?: string; email?: string; phone?: string };
    purchase?: {
      transaction?: string;
      approved_date?: number;
      order_date?: number;
      price?: { value?: number; currency_value?: string };
    };
  };
};

@Injectable()
export class HotmartPaymentAdapter implements PaymentProviderAdapter {
  verifySignature(request: PaymentWebhookRequest, secret: string): boolean {
    const hottok = request.headers[HOTTOK_HEADER];

    if (!isNonEmptyString(hottok)) {
      return false;
    }

    const providedBuffer = Buffer.from(hottok);
    const expectedBuffer = Buffer.from(secret);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  normalize(request: PaymentWebhookRequest): NormalizedPaymentEvent | null {
    let body: HotmartWebhookBody;

    try {
      body = JSON.parse(request.rawBody.toString('utf-8'));
    } catch {
      return null;
    }

    const type = PURCHASE_EVENTS.has(body.event ?? '')
      ? 'purchase'
      : REFUND_EVENTS.has(body.event ?? '')
        ? 'refund'
        : null;

    const purchase = body.data?.purchase;
    const product = body.data?.product;

    if (
      type === null ||
      !isNonEmptyString(purchase?.transaction) ||
      !isNonEmptyString(product?.name)
    ) {
      return null;
    }

    const occurredAtMs = purchase?.approved_date ?? purchase?.order_date;

    return {
      type,
      externalId: purchase.transaction,
      buyer: {
        email: body.data?.buyer?.email ?? null,
        phone: body.data?.buyer?.phone ?? null,
        name: body.data?.buyer?.name ?? null,
      },
      product: {
        name: product.name,
        id: isDefined(product.id) ? String(product.id) : null,
      },
      amount: {
        value: purchase?.price?.value ?? 0,
        currency: purchase?.price?.currency_value ?? 'BRL',
      },
      occurredAt: isDefined(occurredAtMs) ? new Date(occurredAtMs) : new Date(),
    };
  }
}
