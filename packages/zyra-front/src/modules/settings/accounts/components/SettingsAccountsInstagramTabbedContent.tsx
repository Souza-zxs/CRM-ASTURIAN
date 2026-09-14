import { SettingsAccountsInstagramAutomationRulesSection } from '@/settings/accounts/components/SettingsAccountsInstagramAutomationRulesSection';
import { SettingsAccountsInstagramDiagnosticsSection } from '@/settings/accounts/components/SettingsAccountsInstagramDiagnosticsSection';
import { SettingsAccountsInstagramReportsSection } from '@/settings/accounts/components/SettingsAccountsInstagramReportsSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { TabButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledTabBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type InstagramSettingsTab = 'campaigns' | 'reports' | 'diagnostics';

export const SettingsAccountsInstagramTabbedContent = ({
  instagramChannelId,
}: {
  instagramChannelId: string;
}) => {
  const { t } = useLingui();
  const [activeTab, setActiveTab] = useState<InstagramSettingsTab>('campaigns');

  const tabs: { id: InstagramSettingsTab; title: string }[] = [
    { id: 'campaigns', title: t`Campaigns` },
    { id: 'reports', title: t`Reports` },
    { id: 'diagnostics', title: t`Diagnostics` },
  ];

  return (
    <>
      <StyledTabBar>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            title={tab.title}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </StyledTabBar>
      {activeTab === 'campaigns' && (
        <SettingsAccountsInstagramAutomationRulesSection
          instagramChannelId={instagramChannelId}
        />
      )}
      {activeTab === 'reports' && (
        <SettingsAccountsInstagramReportsSection
          instagramChannelId={instagramChannelId}
        />
      )}
      {activeTab === 'diagnostics' && (
        <SettingsAccountsInstagramDiagnosticsSection
          instagramChannelId={instagramChannelId}
        />
      )}
    </>
  );
};
