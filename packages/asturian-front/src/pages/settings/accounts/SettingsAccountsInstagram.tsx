import { SettingsAccountsInstagramTabbedContent } from '@/settings/accounts/components/SettingsAccountsInstagramTabbedContent';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { useMyInstagramChannels } from '@/settings/accounts/hooks/useMyInstagramChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const SettingsAccountsInstagram = () => {
  const { t } = useLingui();

  const { channels: instagramChannels, loading } = useMyInstagramChannels();
  const instagramChannel = instagramChannels[0];

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (!instagramChannel) {
      return <SettingsNewAccountSection />;
    }

    return (
      <SettingsAccountsInstagramTabbedContent
        instagramChannelId={instagramChannel.id}
      />
    );
  };

  return (
    <SettingsPageLayout
      title={t`Instagram`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`Instagram` },
      ]}
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
