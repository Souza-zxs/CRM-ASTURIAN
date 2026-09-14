import { useCallback } from 'react';

import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isDefined } from 'zyra-shared/utils';

import { whatsappAppIdState } from '@/client-config/states/whatsappAppIdState';
import { whatsappEmbeddedSignupConfigurationIdState } from '@/client-config/states/whatsappEmbeddedSignupConfigurationIdState';
import { CONNECT_WHATSAPP_NUMBER } from '@/settings/accounts/graphql/mutations/connectWhatsappNumber';
import { loadFacebookSdk } from '@/settings/accounts/utils/loadFacebookSdk';
import { parseWhatsappEmbeddedSignupMessage } from '@/settings/accounts/utils/parseWhatsappEmbeddedSignupMessage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type ConnectWhatsappNumberResult = {
  connectWhatsappNumber: {
    whatsappChannelId: string;
    displayPhoneNumber: string;
  };
};

type ConnectWhatsappNumberVariables = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

// WhatsApp Embedded Signup gives us the two halves of the connection on two
// different channels — the FB.login() callback returns the auth `code`,
// while the `waba_id`/`phone_number_id` only arrive via a postMessage the
// Embedded Signup popup sends to this window. Both are required to finish
// connecting a number, and either can arrive first, so we wait for both
// before calling the backend.
export const useConnectWhatsappNumber = () => {
  const whatsappAppId = useAtomStateValue(whatsappAppIdState);
  const whatsappEmbeddedSignupConfigurationId = useAtomStateValue(
    whatsappEmbeddedSignupConfigurationIdState,
  );

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [connectWhatsappNumberMutation, { loading }] = useMutation<
    ConnectWhatsappNumberResult,
    ConnectWhatsappNumberVariables
  >(CONNECT_WHATSAPP_NUMBER);

  const connectWhatsappNumber = useCallback(async () => {
    if (
      !isDefined(whatsappAppId) ||
      !isDefined(whatsappEmbeddedSignupConfigurationId)
    ) {
      enqueueErrorSnackBar({
        message: t`WhatsApp connection is not configured on this server.`,
      });
      return;
    }

    let facebookSdk;

    try {
      facebookSdk = await loadFacebookSdk(whatsappAppId);
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not load the Facebook SDK. Please try again.`,
      });
      return;
    }

    let signupCode: string | undefined;
    let signupData: { phoneNumberId: string; wabaId: string } | undefined;
    let hasSettled = false;

    const finishIfReady = async () => {
      if (hasSettled || !isDefined(signupCode) || !isDefined(signupData)) {
        return;
      }

      hasSettled = true;
      window.removeEventListener('message', handleMessage);

      try {
        const { data } = await connectWhatsappNumberMutation({
          variables: {
            code: signupCode,
            wabaId: signupData.wabaId,
            phoneNumberId: signupData.phoneNumberId,
          },
        });

        enqueueSuccessSnackBar({
          message: t`WhatsApp number ${data?.connectWhatsappNumber.displayPhoneNumber ?? ''} connected.`,
        });
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          enqueueErrorSnackBar({ apolloError: error });
        } else {
          enqueueErrorSnackBar({
            message: t`Failed to connect the WhatsApp number.`,
          });
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const parsed = parseWhatsappEmbeddedSignupMessage(event);

      if (!isDefined(parsed)) {
        return;
      }

      signupData = parsed;
      void finishIfReady();
    };

    window.addEventListener('message', handleMessage);

    facebookSdk.login(
      (response) => {
        if (!isDefined(response.authResponse?.code)) {
          hasSettled = true;
          window.removeEventListener('message', handleMessage);
          return;
        }

        signupCode = response.authResponse.code;
        void finishIfReady();
      },
      {
        config_id: whatsappEmbeddedSignupConfigurationId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        },
      },
    );
  }, [
    whatsappAppId,
    whatsappEmbeddedSignupConfigurationId,
    connectWhatsappNumberMutation,
    enqueueErrorSnackBar,
    enqueueSuccessSnackBar,
  ]);

  return { connectWhatsappNumber, loading };
};
