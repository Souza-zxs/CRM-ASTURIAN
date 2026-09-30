import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'crypto';

import { isDefined } from 'zyra-shared/utils';

import {
  type PaymentProviderAdapter,
  type PaymentWebhookRequest,
} from 'src/modules/payments/adapters/payment-provider-adapter.interface';
import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

// For Zapier, Make, or any other tool that can be configured to POST our own
// contract directly — the body IS the normalized event shape (spec: type,
// externalId, buyer, product, amount, occurredAt), so this adapter is
// mostly a signature check plus light validation, no field translation.
const SIGNATURE_HEADER = 'x-webhook-signature';

type GenericWebhookBody = {
  type?: unknown;
  externalId?: unknown;
  buyer?: { email?: unknown; phone?: unknown; name?: unknown };
  product?: { name?: unknown; id?: unknown };
  amount?: { value?: unknown; currency?: unknown };
  occurredAt?: unknown;
};

@Injectable()
export class GenericPaymentAdapter implements PaymentProviderAdapter {
  verifySignature(request: PaymentWebhookRequest, secret: string): boolean {
    const signature = request.headers[SIGNATURE_HEADER];

    if (!isDefined(signature)) {
      return false;
    }

    const expectedSignature = createHmac('sha256', secret)
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
    let body: GenericWebhookBody;

    try {
      body = JSON.parse(request.rawBody.toString('utf-8'));
    } catch {
      return null;
    }

    if (
      (body.type !== 'purchase' && body.type !== 'refund') ||
      typeof body.externalId !== 'string' ||
      typeof body.product?.name !== 'string' ||
      typeof body.amount?.value !== 'number' ||
      typeof body.amount?.currency !== 'string'
    ) {
      return null;
    }

    const occurredAt = isDefined(body.occurredAt)
      ? new Date(body.occurredAt as string)
      : new Date();

    return {
      type: body.type,
      externalId: body.externalId,
      buyer: {
        email: typeof body.buyer?.email === 'string' ? body.buyer.email : null,
        phone: typeof body.buyer?.phone === 'string' ? body.buyer.phone : null,
        name: typeof body.buyer?.name === 'string' ? body.buyer.name : null,
      },
      product: {
        name: body.product.name,
        id: typeof body.product.id === 'string' ? body.product.id : null,
      },
      amount: {
        value: body.amount.value,
        currency: body.amount.currency,
      },
      occurredAt: isNaN(occurredAt.getTime()) ? new Date() : occurredAt,
    };
  }
}
