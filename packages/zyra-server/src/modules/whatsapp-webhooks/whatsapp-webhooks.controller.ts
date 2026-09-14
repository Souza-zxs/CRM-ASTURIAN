import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  type RawBodyRequest,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { type Response, type Request } from 'express';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { WhatsappInboundWebhookRouterService } from 'src/modules/whatsapp-webhooks/services/whatsapp-inbound-webhook-router.service';
import { WhatsappSignatureVerifierService } from 'src/modules/whatsapp-webhooks/services/whatsapp-signature-verifier.service';
import { type WhatsappWebhookPayload } from 'src/modules/whatsapp-webhooks/types/whatsapp-webhook-payload.type';

@Controller()
export class WhatsappWebhooksController {
  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly whatsappSignatureVerifierService: WhatsappSignatureVerifierService,
    private readonly whatsappInboundWebhookRouterService: WhatsappInboundWebhookRouterService,
  ) {}

  // One-time handshake Meta performs when the webhook URL is configured in
  // the App dashboard — must echo back hub.challenge as plain text.
  @Get(['webhooks/whatsapp'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  verifyWebhookSubscription(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() response: Response,
  ): void {
    const expectedVerifyToken = this.zyraConfigService.get(
      'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    );

    if (
      mode === 'subscribe' &&
      expectedVerifyToken &&
      verifyToken === expectedVerifyToken
    ) {
      response.status(HttpStatus.OK).send(challenge);

      return;
    }

    throw new UnauthorizedException('Invalid webhook verify token');
  }

  @Post(['webhooks/whatsapp'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    const rawBody = request.rawBody ?? Buffer.from('');
    const signatureHeader = request.headers['x-hub-signature-256'] as
      | string
      | undefined;

    if (!this.whatsappSignatureVerifierService.isValid(rawBody, signatureHeader)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody.toString('utf-8')) as WhatsappWebhookPayload;

    await this.whatsappInboundWebhookRouterService.route(payload);
  }
}
