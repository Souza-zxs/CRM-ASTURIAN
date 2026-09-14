import { type InstagramTokenStatus } from '@/accounts/types/InstagramDiagnostics';
import { useInstagramDiagnostics } from '@/settings/accounts/hooks/useInstagramDiagnostics';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ThemeColor } from 'zyra-ui/theme';
import { Status } from 'zyra-ui/data-display';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCardLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-transform: uppercase;
`;

const StyledCardValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const TOKEN_STATUS_COLOR: Record<InstagramTokenStatus, ThemeColor> = {
  VALID: 'green',
  EXPIRING_SOON: 'orange',
  EXPIRED: 'red',
  UNKNOWN: 'gray',
};

const formatDateTime = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : '-';

export const SettingsAccountsInstagramDiagnosticsSection = ({
  instagramChannelId,
}: {
  instagramChannelId: string;
}) => {
  const { t } = useLingui();
  const { diagnostics, loading } = useInstagramDiagnostics(instagramChannelId);

  const TOKEN_STATUS_LABEL: Record<InstagramTokenStatus, string> = {
    VALID: t`Valid`,
    EXPIRING_SOON: t`Expiring soon`,
    EXPIRED: t`Expired`,
    UNKNOWN: t`Unknown`,
  };

  return (
    <Section>
      <H2Title
        title={t`Diagnostics`}
        description={t`Health checks for the Instagram connection powering your campaigns.`}
      />
      {loading && (
        <SettingsEmptyPlaceholder>{t`Loading diagnostics...`}</SettingsEmptyPlaceholder>
      )}
      {!loading && !diagnostics && (
        <SettingsEmptyPlaceholder>{t`Diagnostics are not available yet`}</SettingsEmptyPlaceholder>
      )}
      {!loading && diagnostics && (
        <StyledGrid>
          <StyledCard>
            <StyledCardLabel>{t`Access token`}</StyledCardLabel>
            <Status
              color={TOKEN_STATUS_COLOR[diagnostics.tokenStatus]}
              text={TOKEN_STATUS_LABEL[diagnostics.tokenStatus]}
              weight="medium"
            />
          </StyledCard>
          <StyledCard>
            <StyledCardLabel>{t`Last webhook received`}</StyledCardLabel>
            <StyledCardValue>
              {formatDateTime(diagnostics.lastWebhookReceivedAt)}
            </StyledCardValue>
          </StyledCard>
          <StyledCard>
            <StyledCardLabel>{t`Last reconciliation`}</StyledCardLabel>
            <StyledCardValue>
              {formatDateTime(diagnostics.lastReconciliationAt)}
            </StyledCardValue>
          </StyledCard>
          <StyledCard>
            <StyledCardLabel>{t`Pending jobs`}</StyledCardLabel>
            <StyledCardValue>{diagnostics.pendingJobsCount}</StyledCardValue>
          </StyledCard>
          <StyledCard>
            <StyledCardLabel>{t`Failed jobs`}</StyledCardLabel>
            <StyledCardValue>{diagnostics.failedJobsCount}</StyledCardValue>
          </StyledCard>
        </StyledGrid>
      )}
    </Section>
  );
};
