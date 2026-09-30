import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'zyra-shared/utils';
import { Repository } from 'typeorm';

import { PaymentWebhookEventLogEntity } from 'src/engine/metadata-modules/payments/entities/payment-webhook-event-log.entity';
import { type PaymentProvider } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { type NormalizedPaymentEventType } from 'src/modules/payments/types/normalized-payment-event.type';

export type PaymentWebhookEventKey = {
  workspaceId: string;
  provider: PaymentProvider;
  externalId: string;
  type: NormalizedPaymentEventType;
};

// A purchase and its later refund share the platform's transaction id but
// are two distinct effects — each is idempotent on its own (see
// PaymentWebhookEventLogEntity's unique index), not on externalId alone.
@Injectable()
export class PaymentWebhookIdempotencyService {
  constructor(
    @InjectRepository(PaymentWebhookEventLogEntity)
    private readonly eventLogRepository: Repository<PaymentWebhookEventLogEntity>,
  ) {}

  async hasAlreadySucceeded(key: PaymentWebhookEventKey): Promise<boolean> {
    const existing = await this.eventLogRepository.findOne({
      where: key,
    });

    return isDefined(existing) && isDefined(existing.succeededAt);
  }

  async markSucceeded(key: PaymentWebhookEventKey): Promise<void> {
    const existing = await this.eventLogRepository.findOne({ where: key });

    if (isDefined(existing)) {
      await this.eventLogRepository.update(existing.id, {
        succeededAt: new Date(),
      });

      return;
    }

    await this.eventLogRepository.save(
      this.eventLogRepository.create({ ...key, succeededAt: new Date() }),
    );
  }
}
