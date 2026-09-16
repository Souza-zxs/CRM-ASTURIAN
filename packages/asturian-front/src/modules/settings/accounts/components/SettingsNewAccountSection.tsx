import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { t } from '@lingui/core/macro';
import { H2Title } from 'zyra-ui/typography';
import { Section } from 'zyra-ui/layout';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <H2Title
        title={t`New account`}
        description={t`Connect a new account to your workspace`}
      />
      <SettingsAccountsListEmptyStateCard />
    </Section>
  );
};
