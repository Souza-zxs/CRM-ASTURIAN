import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { PaymentProviderConnectionEntity } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { PaymentWebhookEventLogEntity } from 'src/engine/metadata-modules/payments/entities/payment-webhook-event-log.entity';
import { GenericPaymentAdapter } from 'src/modules/payments/adapters/generic-payment-adapter';
import { HotmartPaymentAdapter } from 'src/modules/payments/adapters/hotmart-payment-adapter';
import { KiwifyPaymentAdapter } from 'src/modules/payments/adapters/kiwify-payment-adapter';
import { StripePaymentAdapter } from 'src/modules/payments/adapters/stripe-payment-adapter';
import { PaymentWebhookController } from 'src/modules/payments/controllers/payment-webhook.controller';
import { PaymentEventProcessorService } from 'src/modules/payments/services/payment-event-processor.service';
import { PaymentProviderConnectionLookupService } from 'src/modules/payments/services/payment-provider-connection-lookup.service';
import { PaymentWebhookIdempotencyService } from 'src/modules/payments/services/payment-webhook-idempotency.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentProviderConnectionEntity,
      PaymentWebhookEventLogEntity,
    ]),
    RecordCrudModule,
    SecretEncryptionModule,
  ],
  controllers: [PaymentWebhookController],
  providers: [
    HotmartPaymentAdapter,
    KiwifyPaymentAdapter,
    StripePaymentAdapter,
    GenericPaymentAdapter,
    PaymentProviderConnectionLookupService,
    PaymentWebhookIdempotencyService,
    PaymentEventProcessorService,
  ],
})
export class PaymentsModule {}
