import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconHistory, IconPencil, IconPhone, IconTrash } from 'zyra-ui/icon';
import { IconButton, Toggle } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActionsCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

type SettingsAccountsVoiceAgentRowProps = {
  voiceAgent: VoiceAgent;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (voiceAgent: VoiceAgent) => void;
  onViewCallHistory: (voiceAgentId: string) => void;
  onDelete: (voiceAgentId: string) => void;
};

export const SettingsAccountsVoiceAgentRow = ({
  voiceAgent,
  onToggleActive,
  onEdit,
  onViewCallHistory,
  onDelete,
}: SettingsAccountsVoiceAgentRowProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const deleteModalId = `delete-voice-agent-modal-${voiceAgent.id}`;

  return (
    <TableRow gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr) auto">
      <TableCell>
        <StyledNameCell title={voiceAgent.name}>
          <IconPhone size={16} />
          {voiceAgent.name}
        </StyledNameCell>
      </TableCell>
      <TableCell>{voiceAgent.phoneNumber ?? t`Not defined`}</TableCell>
      <TableCell align="right">
        <StyledActionsCell>
          <Toggle
            value={voiceAgent.isActive}
            aria-label={t`Enable or disable agent`}
            onChange={(isActive) => onToggleActive(voiceAgent.id, isActive)}
          />
          <IconButton
            Icon={IconHistory}
            variant="secondary"
            size="small"
            ariaLabel={t`View call history`}
            onClick={() => onViewCallHistory(voiceAgent.id)}
          />
          <IconButton
            Icon={IconPencil}
            variant="secondary"
            size="small"
            ariaLabel={t`Edit agent`}
            onClick={() => onEdit(voiceAgent)}
          />
          <IconButton
            Icon={IconTrash}
            accent="danger"
            variant="secondary"
            size="small"
            ariaLabel={t`Delete agent`}
            onClick={() => openModal(deleteModalId)}
          />
        </StyledActionsCell>
      </TableCell>
      <ConfirmationModal
        modalInstanceId={deleteModalId}
        title={t`Delete voice agent`}
        subtitle={t`This will permanently delete "${voiceAgent.name}" and it will stop answering or making calls. This action cannot be undone.`}
        onConfirmClick={() => onDelete(voiceAgent.id)}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
      />
    </TableRow>
  );
};
