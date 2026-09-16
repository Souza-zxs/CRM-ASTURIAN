import { type VoiceCall, VoiceCallDirection, VoiceCallStatus } from '@/accounts/types/VoiceCall';
import { useVoiceCalls } from '@/settings/accounts/hooks/useVoiceCalls';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { Status } from 'zyra-ui/data-display';
import { Section } from 'zyra-ui/layout';
import { H2Title } from 'zyra-ui/typography';

const GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)';

const formatDuration = (durationSeconds: number | null): string => {
  if (durationSeconds === null) {
    return '-';
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const CallDirectionLabel = ({ direction }: { direction: VoiceCallDirection }) => {
  const { t } = useLingui();

  return (
    <>{direction === VoiceCallDirection.INBOUND ? t`Inbound` : t`Outbound`}</>
  );
};

const CallStatusBadge = ({ status }: { status: VoiceCallStatus }) => {
  const { t } = useLingui();

  switch (status) {
    case VoiceCallStatus.IN_PROGRESS:
      return (
        <Status
          color="turquoise"
          text={t`In progress`}
          weight="medium"
          isLoaderVisible
        />
      );
    case VoiceCallStatus.COMPLETED:
      return <Status color="green" text={t`Completed`} weight="medium" />;
    case VoiceCallStatus.FAILED:
      return <Status color="red" text={t`Failed`} weight="medium" />;
    case VoiceCallStatus.NO_ANSWER:
      return <Status color="orange" text={t`No answer`} weight="medium" />;
    default:
      return <Status color="gray" text={t`Unknown`} weight="medium" />;
  }
};

const formatCallDate = (call: VoiceCall): string => {
  const referenceDate = call.startedAt ?? call.createdAt;

  return new Date(referenceDate).toLocaleString();
};

type SettingsAccountsVoiceAgentCallHistoryProps = {
  voiceAgentId: string;
};

export const SettingsAccountsVoiceAgentCallHistory = ({
  voiceAgentId,
}: SettingsAccountsVoiceAgentCallHistoryProps) => {
  const { t } = useLingui();

  const { voiceCalls, loading } = useVoiceCalls(voiceAgentId);

  return (
    <Section>
      <H2Title
        title={t`Call history`}
        description={t`Most recent calls made or received by this agent.`}
      />
      {loading && (
        <SettingsEmptyPlaceholder>{t`Loading calls...`}</SettingsEmptyPlaceholder>
      )}
      {!loading && voiceCalls.length === 0 && (
        <SettingsEmptyPlaceholder>{t`No call recorded yet`}</SettingsEmptyPlaceholder>
      )}
      {!loading && voiceCalls.length > 0 && (
        <Table>
          <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Date`}</TableHeader>
            <TableHeader>{t`Direction`}</TableHeader>
            <TableHeader>{t`Duration`}</TableHeader>
            <TableHeader>{t`Status`}</TableHeader>
            <TableHeader>{t`Summary`}</TableHeader>
          </TableRow>
          <TableBody>
            {voiceCalls.map((call) => (
              <TableRow key={call.id} gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
                <TableCell>{formatCallDate(call)}</TableCell>
                <TableCell>
                  <CallDirectionLabel direction={call.direction} />
                </TableCell>
                <TableCell>{formatDuration(call.durationSeconds)}</TableCell>
                <TableCell>
                  <CallStatusBadge status={call.status} />
                </TableCell>
                <TableCell
                  title={call.summary ?? ''}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {call.summary ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
};
