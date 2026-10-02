import { Trans, useLingui } from '@lingui/react/macro';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsBillingContent } from '@/settings/billing/components/SettingsBillingContent';
import { getSettingsPath } from 'zyra-shared/utils';
import { SettingsPath } from 'zyra-shared/types';
import { usePlans } from '@/settings/billing/hooks/usePlans';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { isPlansLoaded } = usePlans();

  return (
    <SettingsPageLayout
      title={t`Billing`}
      links={[
        {
          children: <Trans>Developer</Trans>,
          href: getSettingsPath(SettingsPath.ApiWebhooks),
        },
        { children: <Trans>Billing</Trans> },
      ]}
    >
      {currentWorkspace && isPlansLoaded ? <SettingsBillingContent /> : <></>}
    </SettingsPageLayout>
  );
};
