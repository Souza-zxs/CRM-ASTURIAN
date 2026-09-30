import {
  Controller,
  ForbiddenException,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';

import { type Request } from 'express';
import { isDefined } from 'zyra-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PaymentProvider } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { GenericPaymentAdapter } from 'src/modules/payments/adapters/generic-payment-adapter';
import { HotmartPaymentAdapter } from 'src/modules/payments/adapters/hotmart-payment-adapter';
import { KiwifyPaymentAdapter } from 'src/modules/payments/adapters/kiwify-payment-adapter';
import { type PaymentProviderAdapter } from 'src/modules/payments/adapters/payment-provider-adapter.interface';
import { StripePaymentAdapter } from 'src/modules/payments/adapters/stripe-payment-adapter';
import { PaymentEventProcessorService } from 'src/modules/payments/services/payment-event-processor.service';
import { PaymentProviderConnectionLookupService } from 'src/modules/payments/services/payment-provider-connection-lookup.service';
import { PaymentWebhookIdempotencyService } from 'src/modules/payments/services/payment-webhook-idempotency.service';

// Fully public, unauthenticated surface — same convention as
// FunnelPublicController: the workspace and platform are identified by
// path params, not an auth session, since payment platforms have none of
// ours. Trust instead comes from each adapter's signature verification.
@Controller('payments')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);
  private readonly adaptersByProvider: Record<
    PaymentProvider,
    PaymentProviderAdapter
  >;

  constructor(
    hotmartPaymentAdapter: HotmartPaymentAdapter,
    kiwifyPaymentAdapter: KiwifyPaymentAdapter,
    stripePaymentAdapter: StripePaymentAdapter,
    genericPaymentAdapter: GenericPaymentAdapter,
    private readonly connectionLookupService: PaymentProviderConnectionLookupService,
    private readonly idempotencyService: PaymentWebhookIdempotencyService,
    private readonly eventProcessorService: PaymentEventProcessorService,
  ) {
    this.adaptersByProvider = {
      [PaymentProvider.HOTMART]: hotmartPaymentAdapter,
      [PaymentProvider.KIWIFY]: kiwifyPaymentAdapter,
      [PaymentProvider.STRIPE]: stripePaymentAdapter,
      [PaymentProvider.GENERIC]: genericPaymentAdapter,
    };
  }

  @Post(':workspaceId/:provider')
  @HttpCode(200)
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('provider') providerParam: string,
    @Query() query: Record<string, string>,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const provider = this.parseProvider(providerParam);

    if (!isDefined(req.rawBody)) {
      throw new NotFoundException('Missing request body');
    }

    const secret = await this.connectionLookupService.findEnabledSecret({
      workspaceId,
      provider,
    });

    if (!isDefined(secret)) {
      // Platform disabled/never connected — do not distinguish this from
      // "unknown workspace" in the response, same reasoning as returning a
      // generic 404 for any other unrecognized resource.
      throw new NotFoundException('Payment platform not connected');
    }

    const adapter = this.adaptersByProvider[provider];
    const request = {
      rawBody: req.rawBody,
      headers: Object.fromEntries(
        Object.entries(req.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ]),
      ),
      query,
    };

    if (!adapter.verifySignature(request, secret)) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    const event = adapter.normalize(request);

    if (event === null) {
      return { received: true };
    }

    const idempotencyKey = {
      workspaceId,
      provider,
      externalId: event.externalId,
      type: event.type,
    };

    if (await this.idempotencyService.hasAlreadySucceeded(idempotencyKey)) {
      return { received: true };
    }

    await this.eventProcessorService.processEvent({
      workspaceId,
      provider,
      event,
    });

    await this.idempotencyService.markSucceeded(idempotencyKey);

    return { received: true };
  }

  private parseProvider(providerParam: string): PaymentProvider {
    const provider = providerParam.toUpperCase();

    if (
      !Object.values(PaymentProvider).includes(provider as PaymentProvider)
    ) {
      throw new NotFoundException(`Unknown payment provider: ${providerParam}`);
    }

    return provider as PaymentProvider;
  }
}
