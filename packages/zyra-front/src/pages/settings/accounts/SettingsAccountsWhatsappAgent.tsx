import { SettingsAccountsWhatsappAgentsSection } from '@/settings/accounts/components/SettingsAccountsWhatsappAgentsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const SettingsAccountsWhatsappAgent = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`WhatsApp AI Agent`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`WhatsApp AI Agent` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAccountsWhatsappAgentsSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
