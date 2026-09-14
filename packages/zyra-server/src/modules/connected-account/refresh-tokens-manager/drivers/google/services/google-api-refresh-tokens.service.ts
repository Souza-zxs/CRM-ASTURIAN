import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
import { isDefined } from 'zyra-shared/utils';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { parseGoogleOAuthError } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/utils/parse-google-oauth-error.util';
import { type ConnectedAccountPlaintextTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  async refreshTokens(
    refreshToken: PlaintextString,
  ): Promise<ConnectedAccountPlaintextTokens> {
    const oAuth2Client = new google.auth.OAuth2({
      clientId: this.zyraConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: this.zyraConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
      transporterOptions: { fetchImplementation: fetch },
    });

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    try {
      const { token } = await oAuth2Client.getAccessToken();

      if (!isDefined(token)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          'Error refreshing Google tokens: Invalid refresh token',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      return {
        accessToken: token as PlaintextString,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        throw error;
      }

      throw parseGoogleOAuthError(error);
    }
  }
}
