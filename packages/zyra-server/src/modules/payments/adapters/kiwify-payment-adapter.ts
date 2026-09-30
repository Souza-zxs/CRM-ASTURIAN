import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'zyra-shared/utils';

import {
  type PaymentProviderAdapter,
  type PaymentWebhookRequest,
} from 'src/modules/payments/adapters/payment-provider-adapter.interface';
import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

// Kiwify signs the raw body with the per-webhook token (our configured
// secret) as an HMAC-SHA1 hex digest, sent as a `signature` query string
// parameter on the webhook URL itself (not a header).
//
// NOT verified against a live Kiwify account — built from their public API
// docs (sale object shape: docs.kiwify.com.br/api-reference/sales/single)
// and documented webhook trigger names (compra_aprovada, compra_recusada,
// compra_reembolsada, chargeback). Before going live: send one real test
// webhook from Kiwify's dashboard and confirm `webhook_event_type` /
// `order_status` and the customer/product/payment field names below match
// what actually arrives — adjust this file only, the rest of Part B is
// unaffected either way.
const SIGNATURE_QUERY_PARAM = 'signature';

const PURCHASE_EVENT_NAMES = new Set(['compra_aprovada', 'order_approved']);
const REFUND_EVENT_NAMES = new Set([
  'compra_reembolsada',
  'chargeback',
  'order_refunded',
]);
const PURCHASE_STATUS_VALUES = new Set(['paid', 'approved']);
const REFUND_STATUS_VALUES = new Set(['refunded', 'refused', 'chargedback']);

type KiwifyWebhookBody = {
  webhook_event_type?: string;
  order_id?: string;
  id?: string;
  order_status?: string;
  status?: string;
  customer?: { name?: string; email?: string; mobile?: string };
  product?: { id?: string; name?: string };
  payment?: { charge_amount?: number; charge_currency?: string };
  net_amount?: number;
  currency?: string;
  approved_date?: string;
  created_at?: string;
};

@Injectable()
export class KiwifyPaymentAdapter implements PaymentProviderAdapter {
  verifySignature(request: PaymentWebhookRequest, secret: string): boolean {
    const signature = request.query[SIGNATURE_QUERY_PARAM];

    if (!isNonEmptyString(signature)) {
      return false;
    }

    const expectedSignature = createHmac('sha1', secret)
      .update(request.rawBody)
      .digest('hex');

    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  normalize(request: PaymentWebhookRequest): NormalizedPaymentEvent | null {
    let body: KiwifyWebhookBody;

    try {
      body = JSON.parse(request.rawBody.toString('utf-8'));
    } catch {
      return null;
    }

    const eventName = body.webhook_event_type ?? '';
    const statusValue = body.order_status ?? body.status ?? '';

    const type = PURCHASE_EVENT_NAMES.has(eventName) ||
      PURCHASE_STATUS_VALUES.has(statusValue)
      ? 'purchase'
      : REFUND_EVENT_NAMES.has(eventName) ||
          REFUND_STATUS_VALUES.has(statusValue)
        ? 'refund'
        : null;

    const externalId = body.order_id ?? body.id;

    if (type === null || !isNonEmptyString(externalId) || !isNonEmptyString(body.product?.name)) {
      return null;
    }

    const amountValue = body.payment?.charge_amount ?? body.net_amount ?? 0;
    const occurredAtRaw = body.approved_date ?? body.created_at;
    const occurredAt = isDefined(occurredAtRaw)
      ? new Date(occurredAtRaw)
      : new Date();

    return {
      type,
      externalId,
      buyer: {
        email: body.customer?.email ?? null,
        phone: body.customer?.mobile ?? null,
        name: body.customer?.name ?? null,
      },
      product: {
        name: body.product?.name as string,
        id: body.product?.id ?? null,
      },
      amount: {
        // Kiwify's amounts are in cents, same convention as most Brazilian
        // payment platforms.
        value: amountValue / 100,
        currency: body.payment?.charge_currency ?? body.currency ?? 'BRL',
      },
      occurredAt: isNaN(occurredAt.getTime()) ? new Date() : occurredAt,
    };
  }
}
