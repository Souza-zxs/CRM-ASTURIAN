import { SettingsAccountsWhatsappTemplatesSection } from '@/settings/accounts/components/SettingsAccountsWhatsappTemplatesSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const SettingsAccountsWhatsappTemplates = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`WhatsApp Templates`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`WhatsApp Templates` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAccountsWhatsappTemplatesSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
