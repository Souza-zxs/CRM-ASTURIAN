import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { SettingsAccountsWhatsappAgentConversationsList } from '@/settings/accounts/components/SettingsAccountsWhatsappAgentConversationsList';
import {
  SettingsAccountsWhatsappAgentForm,
  type WhatsappAgentFormValues,
} from '@/settings/accounts/components/SettingsAccountsWhatsappAgentForm';
import { SettingsAccountsWhatsappAgentRow } from '@/settings/accounts/components/SettingsAccountsWhatsappAgentRow';
import { useCreateWhatsappAgent } from '@/settings/accounts/hooks/useCreateWhatsappAgent';
import { useDeleteWhatsappAgent } from '@/settings/accounts/hooks/useDeleteWhatsappAgent';
import { useMyWhatsappAgents } from '@/settings/accounts/hooks/useMyWhatsappAgents';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { useUpdateWhatsappAgent } from '@/settings/accounts/hooks/useUpdateWhatsappAgent';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconPlus } from 'zyra-ui/icon';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

const GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) minmax(0, 1fr) auto';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSectionHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

export const SettingsAccountsWhatsappAgentsSection = () => {
  const { t } = useLingui();

  const { whatsappAgents, loading } = useMyWhatsappAgents();
  const { channels: whatsappChannels } = useMyWhatsappChannels();
  const { createWhatsappAgent } = useCreateWhatsappAgent();
  const { updateWhatsappAgent } = useUpdateWhatsappAgent();
  const { deleteWhatsappAgent } = useDeleteWhatsappAgent();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWhatsappAgent, setEditingWhatsappAgent] =
    useState<WhatsappAgent | null>(null);
  const [whatsappAgentIdForConversations, setWhatsappAgentIdForConversations] =
    useState<string | null>(null);

  const hasWhatsappChannels = whatsappChannels.length > 0;

  const handleCreateClick = () => {
    setEditingWhatsappAgent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (whatsappAgent: WhatsappAgent) => {
    setEditingWhatsappAgent(whatsappAgent);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingWhatsappAgent(null);
  };

  const handleSubmitForm = async (values: WhatsappAgentFormValues) => {
    if (editingWhatsappAgent !== null) {
      await updateWhatsappAgent({
        id: editingWhatsappAgent.id,
        name: values.name,
        systemPrompt: values.systemPrompt,
        greetingMessage: values.greetingMessage,
        forbiddenPhrases: values.forbiddenPhrases,
        qualificationCriteria: values.qualificationCriteria,
        handoffInstructions: values.handoffInstructions,
        model: values.model,
      });
    } else {
      await createWhatsappAgent(values);
    }

    setIsFormOpen(false);
    setEditingWhatsappAgent(null);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateWhatsappAgent({ id, isActive });
  };

  const handleDelete = (id: string) => {
    if (whatsappAgentIdForConversations === id) {
      setWhatsappAgentIdForConversations(null);
    }
    deleteWhatsappAgent(id);
  };

  return (
    <>
      <Section>
        <StyledSectionHeader>
          <H2Title
            title={t`WhatsApp agents`}
            description={t`Manage the AI agents that reply to WhatsApp messages on behalf of your business.`}
          />
          {!isFormOpen && hasWhatsappChannels && (
            <Button
              Icon={IconPlus}
              title={t`New agent`}
              onClick={handleCreateClick}
              size="small"
              variant="secondary"
            />
          )}
        </StyledSectionHeader>
        {loading && (
          <SettingsEmptyPlaceholder>{t`Loading agents...`}</SettingsEmptyPlaceholder>
        )}
        {!loading && !hasWhatsappChannels && (
          <SettingsEmptyPlaceholder>{t`Connect a WhatsApp number before creating an agent`}</SettingsEmptyPlaceholder>
        )}
        {!loading &&
          hasWhatsappChannels &&
          whatsappAgents.length === 0 &&
          !isFormOpen && (
            <SettingsEmptyPlaceholder>{t`No WhatsApp agent configured yet`}</SettingsEmptyPlaceholder>
          )}
        {whatsappAgents.length > 0 && (
          <Table>
            <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
              <TableCell>{t`Name`}</TableCell>
              <TableCell>{t`WhatsApp number`}</TableCell>
              <TableCell align="right">{t`Actions`}</TableCell>
            </TableRow>
            <StyledTableRows>
              {whatsappAgents.map((whatsappAgent) => (
                <SettingsAccountsWhatsappAgentRow
                  key={whatsappAgent.id}
                  whatsappAgent={whatsappAgent}
                  whatsappChannels={whatsappChannels}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEdit}
                  onViewConversations={setWhatsappAgentIdForConversations}
                  onDelete={handleDelete}
                />
              ))}
            </StyledTableRows>
          </Table>
        )}
      </Section>
      {isFormOpen && (
        <SettingsAccountsWhatsappAgentForm
          whatsappAgent={editingWhatsappAgent}
          whatsappChannels={whatsappChannels}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}
      {whatsappAgentIdForConversations !== null && (
        <SettingsAccountsWhatsappAgentConversationsList
          whatsappAgentId={whatsappAgentIdForConversations}
        />
      )}
    </>
  );
};
