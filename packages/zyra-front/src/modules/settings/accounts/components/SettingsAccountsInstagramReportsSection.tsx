import { SettingsAccountsInstagramFollowerChart } from '@/settings/accounts/components/SettingsAccountsInstagramFollowerChart';
import { useInstagramFollowerHistory } from '@/settings/accounts/hooks/useInstagramFollowerHistory';
import { useInstagramPublicReport } from '@/settings/accounts/hooks/useInstagramPublicReport';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'zyra-ui/icon';
import { IconButton, Toggle } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

const StyledToggleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledToggleLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledLinkRow = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledLinkText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsAccountsInstagramReportsSection = ({
  instagramChannelId,
}: {
  instagramChannelId: string;
}) => {
  const { t } = useLingui();
  const { origin } = useOrigin();
  const { copyToClipboard } = useCopyToClipboard();

  const { followerHistory, loading: followerHistoryLoading } =
    useInstagramFollowerHistory(instagramChannelId);
  const {
    publicReport,
    loading: publicReportLoading,
    isMutating,
    enablePublicReport,
    disablePublicReport,
  } = useInstagramPublicReport(instagramChannelId);

  const isPublicReportEnabled = publicReport?.isEnabled ?? false;
  const publicReportUrl = publicReport
    ? `${origin}/public/instagram-reports/${publicReport.shareSlug}`
    : null;

  const handleTogglePublicReport = async (isEnabled: boolean) => {
    if (isEnabled) {
      await enablePublicReport();
    } else {
      await disablePublicReport();
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Reports`}
        description={t`Track how your follower count evolves and optionally share a public report.`}
      />
      {followerHistoryLoading && (
        <SettingsEmptyPlaceholder>{t`Loading follower history...`}</SettingsEmptyPlaceholder>
      )}
      {!followerHistoryLoading && followerHistory.length === 0 && (
        <SettingsEmptyPlaceholder>{t`No follower data captured yet`}</SettingsEmptyPlaceholder>
      )}
      {!followerHistoryLoading && followerHistory.length > 0 && (
        <SettingsAccountsInstagramFollowerChart snapshots={followerHistory} />
      )}
      <StyledToggleRow>
        <StyledToggleLabel>{t`Share report publicly`}</StyledToggleLabel>
        <Toggle
          value={isPublicReportEnabled}
          aria-label={t`Share report publicly`}
          disabled={publicReportLoading || isMutating}
          onChange={handleTogglePublicReport}
        />
      </StyledToggleRow>
      {isPublicReportEnabled && publicReportUrl && (
        <StyledLinkRow>
          <StyledLinkText title={publicReportUrl}>{publicReportUrl}</StyledLinkText>
          <IconButton
            Icon={IconCopy}
            variant="secondary"
            size="small"
            ariaLabel={t`Copy public report link`}
            onClick={() => copyToClipboard(publicReportUrl)}
          />
        </StyledLinkRow>
      )}
    </Section>
  );
};
