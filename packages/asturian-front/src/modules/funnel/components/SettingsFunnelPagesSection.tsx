import { type FunnelPage } from '@/funnel/types/FunnelPage';
import {
  SettingsFunnelPageForm,
  type FunnelPageFormValues,
} from '@/funnel/components/SettingsFunnelPageForm';
import { SettingsFunnelPageRow } from '@/funnel/components/SettingsFunnelPageRow';
import { useCreateFunnelPage } from '@/funnel/hooks/useCreateFunnelPage';
import { useDeleteFunnelPage } from '@/funnel/hooks/useDeleteFunnelPage';
import { useFunnelPages } from '@/funnel/hooks/useFunnelPages';
import { usePublishFunnelPage } from '@/funnel/hooks/usePublishFunnelPage';
import { useUpdateFunnelPage } from '@/funnel/hooks/useUpdateFunnelPage';
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

const GRID_TEMPLATE_COLUMNS =
  'minmax(0, 0.6fr) minmax(0, 1fr) minmax(0, 0.5fr) auto';

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

export const SettingsFunnelPagesSection = () => {
  const { t } = useLingui();

  const { funnelPages, loading } = useFunnelPages();
  const { createFunnelPage } = useCreateFunnelPage();
  const { updateFunnelPage } = useUpdateFunnelPage();
  const { deleteFunnelPage } = useDeleteFunnelPage();
  const { publishFunnelPage, unpublishFunnelPage } = usePublishFunnelPage();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFunnelPage, setEditingFunnelPage] =
    useState<FunnelPage | null>(null);

  const handleCreateClick = () => {
    setEditingFunnelPage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (funnelPage: FunnelPage) => {
    setEditingFunnelPage(funnelPage);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingFunnelPage(null);
  };

  const handleSubmitForm = async (values: FunnelPageFormValues) => {
    if (editingFunnelPage !== null) {
      await updateFunnelPage({
        id: editingFunnelPage.id,
        slug: values.slug,
        content: values.content,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
      });
    } else {
      await createFunnelPage(values);
    }

    setIsFormOpen(false);
    setEditingFunnelPage(null);
  };

  return (
    <>
      <Section>
        <StyledSectionHeader>
          <H2Title
            title={t`Funnel pages`}
            description={t`Manage the signup, workshop, sales and confirmation pages served publicly by the funnel site.`}
          />
          {!isFormOpen && (
            <Button
              Icon={IconPlus}
              title={t`New page`}
              onClick={handleCreateClick}
              size="small"
              variant="secondary"
            />
          )}
        </StyledSectionHeader>
        {loading && (
          <SettingsEmptyPlaceholder>{t`Loading pages...`}</SettingsEmptyPlaceholder>
        )}
        {!loading && funnelPages.length === 0 && !isFormOpen && (
          <SettingsEmptyPlaceholder>{t`No funnel page created yet`}</SettingsEmptyPlaceholder>
        )}
        {funnelPages.length > 0 && (
          <Table>
            <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
              <TableCell>{t`Slug`}</TableCell>
              <TableCell>{t`Type`}</TableCell>
              <TableCell>{t`Status`}</TableCell>
              <TableCell align="right">{t`Actions`}</TableCell>
            </TableRow>
            <StyledTableRows>
              {funnelPages.map((funnelPage) => (
                <SettingsFunnelPageRow
                  key={funnelPage.id}
                  funnelPage={funnelPage}
                  onEdit={handleEdit}
                  onDelete={deleteFunnelPage}
                  onPublish={publishFunnelPage}
                  onUnpublish={unpublishFunnelPage}
                />
              ))}
            </StyledTableRows>
          </Table>
        )}
      </Section>
      {isFormOpen && (
        <SettingsFunnelPageForm
          funnelPage={editingFunnelPage}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}
    </>
  );
};
