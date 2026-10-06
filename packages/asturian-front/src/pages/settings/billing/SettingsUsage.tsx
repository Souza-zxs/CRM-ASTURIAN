import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsUsageAnalyticsSection } from '@/settings/usage/components/SettingsUsageAnalyticsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { getSettingsPath } from 'zyra-shared/utils';
import { SettingsPath } from 'zyra-shared/types';

export const SettingsUsage = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Usage`}
      links={[
        {
          children: <Trans>Developer</Trans>,
          href: getSettingsPath(SettingsPath.ApiWebhooks),
        },
        {
          children: <Trans>Billing</Trans>,
          href: getSettingsPath(SettingsPath.Billing),
        },
        { children: <Trans>Usage</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <SettingsUsageAnalyticsSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
