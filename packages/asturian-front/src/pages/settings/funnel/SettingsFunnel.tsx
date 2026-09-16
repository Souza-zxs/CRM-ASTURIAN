import { SettingsFunnelPagesSection } from '@/funnel/components/SettingsFunnelPagesSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';

export const SettingsFunnel = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Funnel`}
      links={[{ children: t`Workspace` }, { children: t`Funnel` }]}
    >
      <SettingsPageContainer>
        <SettingsFunnelPagesSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
