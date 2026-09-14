import { CONNECT_INSTAGRAM_ACCOUNT } from '@/settings/accounts/graphql/mutations/connectInstagramAccount';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import { AnimatedPlaceholder } from 'zyra-ui/feedback';

// Landing point for the Instagram Login redirect (see
// useConnectInstagramAccount). Reads the `code` query param the redirect
// carries back and finishes the connection server-side, then routes into the
// channel settings page.
export const SettingsAccountsInstagramCallback = () => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();
  const hasStarted = useRef(false);

  const [connectInstagramAccount] = useMutation(CONNECT_INSTAGRAM_ACCOUNT);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    const code = searchParams.get('code');

    if (!code) {
      enqueueErrorSnackBar({
        message: t`Instagram did not return an authorization code.`,
      });
      navigate(getSettingsPath(SettingsPath.Accounts));
      return;
    }

    connectInstagramAccount({ variables: { code } })
      .catch((error) => {
        if (CombinedGraphQLErrors.is(error)) {
          enqueueErrorSnackBar({ apolloError: error });
        } else {
          enqueueErrorSnackBar({
            message: t`Failed to connect the Instagram account.`,
          });
        }
      })
      .finally(() => {
        navigate(getSettingsPath(SettingsPath.AccountsInstagram));
      });
  }, [searchParams, connectInstagramAccount, enqueueErrorSnackBar, navigate, t]);

  return (
    <AnimatedPlaceholder type="loadingAccounts" />
  );
};
