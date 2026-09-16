import { useSetWhatsappAgentConversationAiEnabled } from '@/settings/accounts/hooks/useSetWhatsappAgentConversationAiEnabled';
import { useWhatsappAgentConversations } from '@/settings/accounts/hooks/useWhatsappAgentConversations';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { Toggle } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { H2Title } from 'zyra-ui/typography';

const GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)';

const formatLastMessageDate = (lastMessageAt: string | null): string => {
  if (lastMessageAt === null) {
    return '-';
  }

  return new Date(lastMessageAt).toLocaleString();
};

type SettingsAccountsWhatsappAgentConversationsListProps = {
  whatsappAgentId: string;
};

export const SettingsAccountsWhatsappAgentConversationsList = ({
  whatsappAgentId,
}: SettingsAccountsWhatsappAgentConversationsListProps) => {
  const { t } = useLingui();

  const { whatsappAgentConversations, loading } = useWhatsappAgentConversations(
    whatsappAgentId,
  );
  const { setWhatsappAgentConversationAiEnabled } =
    useSetWhatsappAgentConversationAiEnabled();

  return (
    <Section>
      <H2Title
        title={t`Conversations`}
        description={t`Turn off the AI on a specific conversation to take over and reply as a human without disabling the whole agent.`}
      />
      {loading && (
        <SettingsEmptyPlaceholder>{t`Loading conversations...`}</SettingsEmptyPlaceholder>
      )}
      {!loading && whatsappAgentConversations.length === 0 && (
        <SettingsEmptyPlaceholder>{t`No conversation recorded yet`}</SettingsEmptyPlaceholder>
      )}
      {!loading && whatsappAgentConversations.length > 0 && (
        <Table>
          <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Contact`}</TableHeader>
            <TableHeader>{t`Qualification summary`}</TableHeader>
            <TableHeader>{t`Last message`}</TableHeader>
            <TableHeader>{t`AI enabled`}</TableHeader>
          </TableRow>
          <TableBody>
            {whatsappAgentConversations.map((conversation) => (
              <TableRow
                key={conversation.id}
                gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
              >
                <TableCell>{conversation.contactPhoneNumber}</TableCell>
                <TableCell
                  title={conversation.qualificationSummary ?? ''}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {conversation.qualificationSummary ?? '-'}
                </TableCell>
                <TableCell>
                  {formatLastMessageDate(conversation.lastMessageAt)}
                </TableCell>
                <TableCell>
                  <Toggle
                    value={conversation.isAiEnabled}
                    aria-label={t`Enable or disable AI on this conversation`}
                    onChange={(isAiEnabled) =>
                      setWhatsappAgentConversationAiEnabled(
                        conversation.id,
                        isAiEnabled,
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
};
