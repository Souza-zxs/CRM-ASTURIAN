import { Injectable, Logger } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'crypto';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

// Twilio's request-signing algorithm
// (https://www.twilio.com/docs/usage/security#validating-requests):
// take the exact URL Twilio was configured to POST to, append every POST
// parameter's key immediately followed by its value (no delimiter),
// sorted alphabetically by key, then HMAC-SHA1 the resulting string with the
// Auth Token and base64-encode it. Twilio sends the result in
// X-Twilio-Signature. Unlike Meta's webhooks (HMAC over the raw JSON body),
// Twilio signs the already-parsed application/x-www-form-urlencoded fields,
// so this reads from the parsed body rather than a raw byte buffer.
@Injectable()
export class TwilioSignatureVerifierService {
  private readonly logger = new Logger(TwilioSignatureVerifierService.name);

  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  isValid({
    url,
    params,
    signatureHeader,
  }: {
    url: string;
    params: Record<string, string>;
    signatureHeader: string | undefined;
  }): boolean {
    if (!signatureHeader) {
      this.logger.warn('Missing X-Twilio-Signature header');

      return false;
    }

    const authToken = this.zyraConfigService.get('TWILIO_AUTH_TOKEN');

    if (!authToken) {
      this.logger.warn('TWILIO_AUTH_TOKEN is not configured');

      return false;
    }

    const sortedParamsString = Object.keys(params)
      .sort()
      .reduce((accumulator, key) => accumulator + key + params[key], '');

    const expectedSignature = createHmac('sha1', authToken)
      .update(url + sortedParamsString, 'utf-8')
      .digest('base64');

    let expectedBuffer: Buffer;
    let providedBuffer: Buffer;

    try {
      expectedBuffer = Buffer.from(expectedSignature, 'base64');
      providedBuffer = Buffer.from(signatureHeader, 'base64');
    } catch {
      return false;
    }

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, providedBuffer);
  }
}
