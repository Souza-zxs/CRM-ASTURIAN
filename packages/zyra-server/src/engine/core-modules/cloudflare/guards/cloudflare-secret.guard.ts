/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const cloudflareWebhookSecret = this.zyraConfigService.get(
      'CLOUDFLARE_WEBHOOK_SECRET',
    );

    if (!cloudflareWebhookSecret) {
      throw new InternalServerErrorException(
        'CLOUDFLARE_WEBHOOK_SECRET is not configured',
      );
    }

    try {
      const request = context.switchToHttp().getRequest();

      const headerValue = request.headers['cf-webhook-auth'];

      if (typeof headerValue !== 'string' || headerValue.length === 0) {
        return false;
      }

      const headerBuffer = Buffer.from(headerValue);
      const secretBuffer = Buffer.from(cloudflareWebhookSecret);

      if (headerBuffer.length !== secretBuffer.length) {
        return false;
      }

      if (timingSafeEqual(headerBuffer, secretBuffer)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
