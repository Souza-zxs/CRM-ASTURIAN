import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { type WhatsappChannel } from '@/accounts/types/WhatsappChannel';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconMessage, IconPencil, IconRobot, IconTrash } from 'zyra-ui/icon';
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

const GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) minmax(0, 1fr) auto';

type SettingsAccountsWhatsappAgentRowProps = {
  whatsappAgent: WhatsappAgent;
  whatsappChannels: WhatsappChannel[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (whatsappAgent: WhatsappAgent) => void;
  onViewConversations: (whatsappAgentId: string) => void;
  onDelete: (whatsappAgentId: string) => void;
};

export const SettingsAccountsWhatsappAgentRow = ({
  whatsappAgent,
  whatsappChannels,
  onToggleActive,
  onEdit,
  onViewConversations,
  onDelete,
}: SettingsAccountsWhatsappAgentRowProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const deleteModalId = `delete-whatsapp-agent-modal-${whatsappAgent.id}`;

  const whatsappChannel = whatsappChannels.find(
    (channel) => channel.id === whatsappAgent.whatsappChannelId,
  );

  return (
    <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
      <TableCell>
        <StyledNameCell title={whatsappAgent.name}>
          <IconRobot size={16} />
          {whatsappAgent.name}
        </StyledNameCell>
      </TableCell>
      <TableCell>
        {whatsappChannel?.displayPhoneNumber ?? t`Not defined`}
      </TableCell>
      <TableCell align="right">
        <StyledActionsCell>
          <Toggle
            value={whatsappAgent.isActive}
            aria-label={t`Enable or disable agent`}
            onChange={(isActive) => onToggleActive(whatsappAgent.id, isActive)}
          />
          <IconButton
            Icon={IconMessage}
            variant="secondary"
            size="small"
            ariaLabel={t`View conversations`}
            onClick={() => onViewConversations(whatsappAgent.id)}
          />
          <IconButton
            Icon={IconPencil}
            variant="secondary"
            size="small"
            ariaLabel={t`Edit agent`}
            onClick={() => onEdit(whatsappAgent)}
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
        title={t`Delete WhatsApp agent`}
        subtitle={t`This will permanently delete "${whatsappAgent.name}" and it will stop replying to WhatsApp messages. This action cannot be undone.`}
        onConfirmClick={() => onDelete(whatsappAgent.id)}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
      />
    </TableRow>
  );
};
