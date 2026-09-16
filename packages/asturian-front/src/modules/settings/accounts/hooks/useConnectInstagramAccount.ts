import { useCallback } from 'react';

import { t } from '@lingui/core/macro';
import { isDefined } from 'zyra-shared/utils';

import { instagramAppIdState } from '@/client-config/states/instagramAppIdState';
import { instagramOauthRedirectUriState } from '@/client-config/states/instagramOauthRedirectUriState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const INSTAGRAM_OAUTH_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize';

// Scopes needed to list recent media (post picker), read comment webhooks,
// and send private replies. See:
// https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login-for-instagram
const INSTAGRAM_OAUTH_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
].join(',');

// Unlike WhatsApp's Embedded Signup (a popup that posts a `code` back via
// window.postMessage), Instagram Login is a standard full-page OAuth
// redirect: the browser leaves the app entirely and comes back to
// INSTAGRAM_OAUTH_REDIRECT_URI with a `code` query param, handled by
// SettingsAccountsInstagramCallback.
export const useConnectInstagramAccount = () => {
  const instagramAppId = useAtomStateValue(instagramAppIdState);
  const instagramOauthRedirectUri = useAtomStateValue(
    instagramOauthRedirectUriState,
  );

  const { enqueueErrorSnackBar } = useSnackBar();
  const { redirect } = useRedirect();

  const connectInstagramAccount = useCallback(() => {
    if (!isDefined(instagramAppId) || !isDefined(instagramOauthRedirectUri)) {
      enqueueErrorSnackBar({
        message: t`Instagram connection is not configured on this server.`,
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: instagramAppId,
      redirect_uri: instagramOauthRedirectUri,
      response_type: 'code',
      scope: INSTAGRAM_OAUTH_SCOPES,
    });

    redirect(`${INSTAGRAM_OAUTH_AUTHORIZE_URL}?${params.toString()}`);
  }, [instagramAppId, instagramOauthRedirectUri, enqueueErrorSnackBar, redirect]);

  return { connectInstagramAccount };
};
