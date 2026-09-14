import { SettingsAccountsWhatsappChannelsListCard } from '@/settings/accounts/components/SettingsAccountsWhatsappChannelsListCard';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import { Section } from 'zyra-ui/layout';

export const SettingsAccountsWhatsapp = () => {
  const { t } = useLingui();

  const { channels: whatsappChannels, loading } = useMyWhatsappChannels();

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (whatsappChannels.length === 0) {
      return <SettingsNewAccountSection />;
    }

    return (
      <Section>
        <SettingsAccountsWhatsappChannelsListCard
          whatsappChannels={whatsappChannels}
        />
      </Section>
    );
  };

  return (
    <SettingsPageLayout
      title={t`WhatsApp`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`WhatsApp` },
      ]}
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
