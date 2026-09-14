import { Injectable, Logger } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'crypto';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

const SIGNATURE_PREFIX = 'sha256=';

// Meta signs every webhook POST body with the App Secret
// (X-Hub-Signature-256: sha256=<hex hmac>). Verifying this is the only thing
// standing between the endpoint and anyone on the internet POSTing fake
// comment events into a client's CRM inbox, since the endpoint is otherwise
// public (PublicEndpointGuard) — Meta has no other way to reach it. Mirrors
// WhatsappSignatureVerifierService exactly (same Meta webhook convention).
@Injectable()
export class InstagramSignatureVerifierService {
  private readonly logger = new Logger(InstagramSignatureVerifierService.name);

  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  isValid(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader?.startsWith(SIGNATURE_PREFIX)) {
      this.logger.warn('Missing or malformed X-Hub-Signature-256 header');

      return false;
    }

    const appSecret = this.zyraConfigService.get('INSTAGRAM_APP_SECRET');

    if (!appSecret) {
      this.logger.warn('INSTAGRAM_APP_SECRET is not configured');

      return false;
    }

    const expectedSignature = createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');
    const providedSignature = signatureHeader.slice(SIGNATURE_PREFIX.length);

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(providedSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, providedBuffer);
  }
}
