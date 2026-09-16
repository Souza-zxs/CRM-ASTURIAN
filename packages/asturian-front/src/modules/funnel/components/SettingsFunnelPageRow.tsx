import { type FunnelPage } from '@/funnel/types/FunnelPage';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconEye, IconEyeOff, IconPencil, IconTrash } from 'zyra-ui/icon';
import { IconButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { Tag, type TagColor } from 'zyra-ui/data-display';

const GRID_TEMPLATE_COLUMNS =
  'minmax(0, 0.6fr) minmax(0, 1fr) minmax(0, 0.5fr) auto';

const StyledSlugCell = styled.div`
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

const STATUS_COLOR: Record<FunnelPage['status'], TagColor> = {
  DRAFT: 'gray',
  PUBLISHED: 'green',
};

type SettingsFunnelPageRowProps = {
  funnelPage: FunnelPage;
  onEdit: (funnelPage: FunnelPage) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
};

export const SettingsFunnelPageRow = ({
  funnelPage,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: SettingsFunnelPageRowProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const deleteModalId = `delete-funnel-page-modal-${funnelPage.id}`;
  const isPublished = funnelPage.status === 'PUBLISHED';

  return (
    <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
      <TableCell>
        <StyledSlugCell title={funnelPage.slug}>
          /{funnelPage.slug}
        </StyledSlugCell>
      </TableCell>
      <TableCell>{funnelPage.type}</TableCell>
      <TableCell>
        <Tag
          color={STATUS_COLOR[funnelPage.status]}
          text={funnelPage.status}
        />
      </TableCell>
      <TableCell align="right">
        <StyledActionsCell>
          <IconButton
            Icon={isPublished ? IconEyeOff : IconEye}
            variant="secondary"
            size="small"
            ariaLabel={isPublished ? t`Unpublish` : t`Publish`}
            onClick={() =>
              isPublished ? onUnpublish(funnelPage.id) : onPublish(funnelPage.id)
            }
          />
          <IconButton
            Icon={IconPencil}
            variant="secondary"
            size="small"
            ariaLabel={t`Edit page`}
            onClick={() => onEdit(funnelPage)}
          />
          <IconButton
            Icon={IconTrash}
            accent="danger"
            variant="secondary"
            size="small"
            ariaLabel={t`Delete page`}
            onClick={() => openModal(deleteModalId)}
          />
        </StyledActionsCell>
      </TableCell>
      <ConfirmationModal
        modalInstanceId={deleteModalId}
        title={t`Delete funnel page`}
        subtitle={t`This will permanently delete "/${funnelPage.slug}". This action cannot be undone.`}
        onConfirmClick={() => onDelete(funnelPage.id)}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
      />
    </TableRow>
  );
};
