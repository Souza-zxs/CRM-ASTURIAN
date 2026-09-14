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
import { InstagramInboundWebhookRouterService } from 'src/modules/instagram-webhooks/services/instagram-inbound-webhook-router.service';
import { InstagramSignatureVerifierService } from 'src/modules/instagram-webhooks/services/instagram-signature-verifier.service';
import { type InstagramWebhookPayload } from 'src/modules/instagram-webhooks/types/instagram-webhook-payload.type';

@Controller()
export class InstagramWebhooksController {
  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly instagramSignatureVerifierService: InstagramSignatureVerifierService,
    private readonly instagramInboundWebhookRouterService: InstagramInboundWebhookRouterService,
  ) {}

  // One-time handshake Meta performs when the webhook URL is configured in
  // the App dashboard — must echo back hub.challenge as plain text.
  @Get(['webhooks/instagram'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  verifyWebhookSubscription(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() response: Response,
  ): void {
    const expectedVerifyToken = this.zyraConfigService.get(
      'INSTAGRAM_WEBHOOK_VERIFY_TOKEN',
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

  @Post(['webhooks/instagram'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    const rawBody = request.rawBody ?? Buffer.from('');
    const signatureHeader = request.headers['x-hub-signature-256'] as
      | string
      | undefined;

    if (
      !this.instagramSignatureVerifierService.isValid(
        rawBody,
        signatureHeader,
      )
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const payload = JSON.parse(
      rawBody.toString('utf-8'),
    ) as InstagramWebhookPayload;

    await this.instagramInboundWebhookRouterService.route(payload);
  }
}
