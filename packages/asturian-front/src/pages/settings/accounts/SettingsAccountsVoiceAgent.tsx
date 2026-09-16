import { SettingsAccountsVoiceAgentsSection } from '@/settings/accounts/components/SettingsAccountsVoiceAgentsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const SettingsAccountsVoiceAgent = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Voice AI Agent`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`Voice AI Agent` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAccountsVoiceAgentsSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
