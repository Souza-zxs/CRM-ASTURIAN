import { type WhatsappTemplate } from '@/accounts/types/WhatsappTemplate';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'zyra-shared/utils';
import { IconPencil, IconRefresh, IconSend, IconTrash } from 'zyra-ui/icon';
import { IconButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { Tag, type TagColor } from 'zyra-ui/data-display';

const GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 0.6fr) auto';

const StyledNameCell = styled.div`
  color: ${themeCssVariables.font.color.primary};
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

const STATUS_COLOR: Record<WhatsappTemplate['status'], TagColor> = {
  DRAFT: 'gray',
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
};

type SettingsAccountsWhatsappTemplateRowProps = {
  whatsappTemplate: WhatsappTemplate;
  onEdit: (whatsappTemplate: WhatsappTemplate) => void;
  onDelete: (id: string) => void;
  onSubmitForApproval: (id: string) => void;
  onRefreshStatus: (id: string) => void;
};

export const SettingsAccountsWhatsappTemplateRow = ({
  whatsappTemplate,
  onEdit,
  onDelete,
  onSubmitForApproval,
  onRefreshStatus,
}: SettingsAccountsWhatsappTemplateRowProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const deleteModalId = `delete-whatsapp-template-modal-${whatsappTemplate.id}`;
  const isEditable =
    whatsappTemplate.status === 'DRAFT' ||
    whatsappTemplate.status === 'REJECTED';

  return (
    <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
      <TableCell>
        <StyledNameCell title={whatsappTemplate.name}>
          {whatsappTemplate.name}
        </StyledNameCell>
      </TableCell>
      <TableCell>{whatsappTemplate.category}</TableCell>
      <TableCell>
        <Tag
          color={STATUS_COLOR[whatsappTemplate.status]}
          text={whatsappTemplate.status}
        />
        {whatsappTemplate.status === 'REJECTED' &&
          isDefined(whatsappTemplate.rejectionReason) && (
            <div title={whatsappTemplate.rejectionReason}>
              {whatsappTemplate.rejectionReason}
            </div>
          )}
      </TableCell>
      <TableCell align="right">
        <StyledActionsCell>
          {isEditable && (
            <IconButton
              Icon={IconSend}
              variant="secondary"
              size="small"
              ariaLabel={t`Submit for approval`}
              onClick={() => onSubmitForApproval(whatsappTemplate.id)}
            />
          )}
          {whatsappTemplate.status === 'PENDING' && (
            <IconButton
              Icon={IconRefresh}
              variant="secondary"
              size="small"
              ariaLabel={t`Refresh status`}
              onClick={() => onRefreshStatus(whatsappTemplate.id)}
            />
          )}
          <IconButton
            Icon={IconPencil}
            variant="secondary"
            size="small"
            ariaLabel={t`Edit template`}
            onClick={() => onEdit(whatsappTemplate)}
          />
          <IconButton
            Icon={IconTrash}
            accent="danger"
            variant="secondary"
            size="small"
            ariaLabel={t`Delete template`}
            onClick={() => openModal(deleteModalId)}
          />
        </StyledActionsCell>
      </TableCell>
      <ConfirmationModal
        modalInstanceId={deleteModalId}
        title={t`Delete WhatsApp template`}
        subtitle={t`This will permanently delete "${whatsappTemplate.name}". This action cannot be undone.`}
        onConfirmClick={() => onDelete(whatsappTemplate.id)}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
      />
    </TableRow>
  );
};
