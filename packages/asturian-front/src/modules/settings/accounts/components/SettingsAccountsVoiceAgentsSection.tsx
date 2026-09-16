import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { SettingsAccountsVoiceAgentCallHistory } from '@/settings/accounts/components/SettingsAccountsVoiceAgentCallHistory';
import {
  SettingsAccountsVoiceAgentForm,
  type VoiceAgentFormValues,
} from '@/settings/accounts/components/SettingsAccountsVoiceAgentForm';
import { SettingsAccountsVoiceAgentRow } from '@/settings/accounts/components/SettingsAccountsVoiceAgentRow';
import { useCreateVoiceAgent } from '@/settings/accounts/hooks/useCreateVoiceAgent';
import { useDeleteVoiceAgent } from '@/settings/accounts/hooks/useDeleteVoiceAgent';
import { useMyVoiceAgents } from '@/settings/accounts/hooks/useMyVoiceAgents';
import { useUpdateVoiceAgent } from '@/settings/accounts/hooks/useUpdateVoiceAgent';
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

export const SettingsAccountsVoiceAgentsSection = () => {
  const { t } = useLingui();

  const { voiceAgents, loading } = useMyVoiceAgents();
  const { createVoiceAgent } = useCreateVoiceAgent();
  const { updateVoiceAgent } = useUpdateVoiceAgent();
  const { deleteVoiceAgent } = useDeleteVoiceAgent();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoiceAgent, setEditingVoiceAgent] = useState<VoiceAgent | null>(
    null,
  );
  const [voiceAgentIdForHistory, setVoiceAgentIdForHistory] = useState<
    string | null
  >(null);

  const handleCreateClick = () => {
    setEditingVoiceAgent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (voiceAgent: VoiceAgent) => {
    setEditingVoiceAgent(voiceAgent);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingVoiceAgent(null);
  };

  const handleSubmitForm = async (values: VoiceAgentFormValues) => {
    if (editingVoiceAgent !== null) {
      await updateVoiceAgent({ id: editingVoiceAgent.id, ...values });
    } else {
      await createVoiceAgent(values);
    }

    setIsFormOpen(false);
    setEditingVoiceAgent(null);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateVoiceAgent({ id, isActive });
  };

  const handleDelete = (id: string) => {
    if (voiceAgentIdForHistory === id) {
      setVoiceAgentIdForHistory(null);
    }
    deleteVoiceAgent(id);
  };

  return (
    <>
      <Section>
        <StyledSectionHeader>
          <H2Title
            title={t`Voice agents`}
            description={t`Manage the AI agents that answer and make phone calls on behalf of your business.`}
          />
          {!isFormOpen && (
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
        {!loading && voiceAgents.length === 0 && !isFormOpen && (
          <SettingsEmptyPlaceholder>{t`No voice agent configured yet`}</SettingsEmptyPlaceholder>
        )}
        {voiceAgents.length > 0 && (
          <Table>
            <TableRow gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr) auto">
              <TableCell>{t`Name`}</TableCell>
              <TableCell>{t`Phone number`}</TableCell>
              <TableCell align="right">{t`Actions`}</TableCell>
            </TableRow>
            <StyledTableRows>
              {voiceAgents.map((voiceAgent) => (
                <SettingsAccountsVoiceAgentRow
                  key={voiceAgent.id}
                  voiceAgent={voiceAgent}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEdit}
                  onViewCallHistory={setVoiceAgentIdForHistory}
                  onDelete={handleDelete}
                />
              ))}
            </StyledTableRows>
          </Table>
        )}
      </Section>
      {isFormOpen && (
        <SettingsAccountsVoiceAgentForm
          voiceAgent={editingVoiceAgent}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}
      {voiceAgentIdForHistory !== null && (
        <SettingsAccountsVoiceAgentCallHistory
          voiceAgentId={voiceAgentIdForHistory}
        />
      )}
    </>
  );
};
