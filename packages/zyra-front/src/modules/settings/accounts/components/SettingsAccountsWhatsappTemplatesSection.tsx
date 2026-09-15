import { type WhatsappTemplate } from '@/accounts/types/WhatsappTemplate';
import {
  SettingsAccountsWhatsappTemplateForm,
  type WhatsappTemplateFormValues,
} from '@/settings/accounts/components/SettingsAccountsWhatsappTemplateForm';
import { SettingsAccountsWhatsappTemplateRow } from '@/settings/accounts/components/SettingsAccountsWhatsappTemplateRow';
import { useCreateWhatsappTemplate } from '@/settings/accounts/hooks/useCreateWhatsappTemplate';
import { useDeleteWhatsappTemplate } from '@/settings/accounts/hooks/useDeleteWhatsappTemplate';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { useMyWhatsappTemplates } from '@/settings/accounts/hooks/useMyWhatsappTemplates';
import { useRefreshWhatsappTemplateStatus } from '@/settings/accounts/hooks/useRefreshWhatsappTemplateStatus';
import { useSubmitWhatsappTemplateForApproval } from '@/settings/accounts/hooks/useSubmitWhatsappTemplateForApproval';
import { useUpdateWhatsappTemplate } from '@/settings/accounts/hooks/useUpdateWhatsappTemplate';
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
  'minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 0.6fr) auto';

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

export const SettingsAccountsWhatsappTemplatesSection = () => {
  const { t } = useLingui();

  const { whatsappTemplates, loading } = useMyWhatsappTemplates();
  const { channels: whatsappChannels } = useMyWhatsappChannels();
  const { createWhatsappTemplate } = useCreateWhatsappTemplate();
  const { updateWhatsappTemplate } = useUpdateWhatsappTemplate();
  const { deleteWhatsappTemplate } = useDeleteWhatsappTemplate();
  const { submitWhatsappTemplateForApproval } =
    useSubmitWhatsappTemplateForApproval();
  const { refreshWhatsappTemplateStatus } = useRefreshWhatsappTemplateStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWhatsappTemplate, setEditingWhatsappTemplate] =
    useState<WhatsappTemplate | null>(null);

  const hasWhatsappChannels = whatsappChannels.length > 0;

  const handleCreateClick = () => {
    setEditingWhatsappTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (whatsappTemplate: WhatsappTemplate) => {
    setEditingWhatsappTemplate(whatsappTemplate);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingWhatsappTemplate(null);
  };

  const handleSubmitForm = async (values: WhatsappTemplateFormValues) => {
    if (editingWhatsappTemplate !== null) {
      await updateWhatsappTemplate({
        id: editingWhatsappTemplate.id,
        name: values.name,
        category: values.category,
        language: values.language,
        headerText: values.headerText,
        bodyText: values.bodyText,
        footerText: values.footerText,
        buttons: values.buttons,
      });
    } else {
      await createWhatsappTemplate(values);
    }

    setIsFormOpen(false);
    setEditingWhatsappTemplate(null);
  };

  return (
    <>
      <Section>
        <StyledSectionHeader>
          <H2Title
            title={t`WhatsApp templates`}
            description={t`Manage the message templates submitted to Meta for approval — required to message a contact outside the 24h window.`}
          />
          {!isFormOpen && hasWhatsappChannels && (
            <Button
              Icon={IconPlus}
              title={t`New template`}
              onClick={handleCreateClick}
              size="small"
              variant="secondary"
            />
          )}
        </StyledSectionHeader>
        {loading && (
          <SettingsEmptyPlaceholder>{t`Loading templates...`}</SettingsEmptyPlaceholder>
        )}
        {!loading && !hasWhatsappChannels && (
          <SettingsEmptyPlaceholder>{t`Connect a WhatsApp number before creating a template`}</SettingsEmptyPlaceholder>
        )}
        {!loading &&
          hasWhatsappChannels &&
          whatsappTemplates.length === 0 &&
          !isFormOpen && (
            <SettingsEmptyPlaceholder>{t`No WhatsApp template created yet`}</SettingsEmptyPlaceholder>
          )}
        {whatsappTemplates.length > 0 && (
          <Table>
            <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
              <TableCell>{t`Name`}</TableCell>
              <TableCell>{t`Category`}</TableCell>
              <TableCell>{t`Status`}</TableCell>
              <TableCell align="right">{t`Actions`}</TableCell>
            </TableRow>
            <StyledTableRows>
              {whatsappTemplates.map((whatsappTemplate) => (
                <SettingsAccountsWhatsappTemplateRow
                  key={whatsappTemplate.id}
                  whatsappTemplate={whatsappTemplate}
                  onEdit={handleEdit}
                  onDelete={deleteWhatsappTemplate}
                  onSubmitForApproval={submitWhatsappTemplateForApproval}
                  onRefreshStatus={refreshWhatsappTemplateStatus}
                />
              ))}
            </StyledTableRows>
          </Table>
        )}
      </Section>
      {isFormOpen && (
        <SettingsAccountsWhatsappTemplateForm
          whatsappTemplate={editingWhatsappTemplate}
          whatsappChannels={whatsappChannels}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}
    </>
  );
};
