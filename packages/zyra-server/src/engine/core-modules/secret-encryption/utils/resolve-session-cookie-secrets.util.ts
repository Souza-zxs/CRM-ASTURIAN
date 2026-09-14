import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { type ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

const SESSION_COOKIE_HMAC_PURPOSE = 'session-cookie';

const buildLegacySessionSecret = (appSecret: string) =>
  createHash('sha256').update(`${appSecret}SESSION_STORE_SECRET`).digest('hex');

export const resolveSessionCookieSecretsOrThrow = ({
  zyraConfigService,
}: {
  zyraConfigService: Pick<ZyraConfigService, 'get'>;
}): string[] => {
  const encryptionKey = zyraConfigService.get('ENCRYPTION_KEY');
  const fallbackEncryptionKey = zyraConfigService.get(
    'FALLBACK_ENCRYPTION_KEY',
  );
  const appSecret = zyraConfigService.get('APP_SECRET');

  const rawPrimary = isNonEmptyString(encryptionKey)
    ? encryptionKey
    : appSecret;

  if (!isNonEmptyString(rawPrimary)) {
    throw new Error(
      'Cannot derive session cookie secret: set ENCRYPTION_KEY (or APP_SECRET for legacy deployments).',
    );
  }

  const secrets: string[] = [
    deriveInstanceHmacKey({
      rawKey: rawPrimary,
      purpose: SESSION_COOKIE_HMAC_PURPOSE,
    }).toString('hex'),
  ];

  if (isNonEmptyString(fallbackEncryptionKey)) {
    secrets.push(
      deriveInstanceHmacKey({
        rawKey: fallbackEncryptionKey,
        purpose: SESSION_COOKIE_HMAC_PURPOSE,
      }).toString('hex'),
    );
  }

  if (isNonEmptyString(appSecret)) {
    secrets.push(buildLegacySessionSecret(appSecret));
  }

  return secrets;
};
