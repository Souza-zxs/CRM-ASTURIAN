import { type InstagramAutomationRule } from '@/accounts/types/InstagramAutomationRule';
import { type InstagramCampaignTemplate } from '@/accounts/types/InstagramCampaignTemplate';
import {
  SettingsAccountsInstagramCampaignForm,
  type SettingsAccountsInstagramCampaignFormValues,
} from '@/settings/accounts/components/SettingsAccountsInstagramCampaignForm';
import { SettingsAccountsInstagramCampaignCsvImportButton } from '@/settings/accounts/components/SettingsAccountsInstagramCampaignCsvImportButton';
import { SettingsAccountsInstagramCampaignTemplatePicker } from '@/settings/accounts/components/SettingsAccountsInstagramCampaignTemplatePicker';
import { SettingsAccountsInstagramAutomationRuleRow } from '@/settings/accounts/components/SettingsAccountsInstagramAutomationRuleRow';
import { useInstagramAutomationRules } from '@/settings/accounts/hooks/useInstagramAutomationRules';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
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

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

// The creation flow has three steps: pick a template (or skip it), fill in
// the campaign form, then go back to the list. Editing an existing campaign
// skips straight to the form.
type CampaignFlowStep = 'list' | 'template-picker' | 'form';

export const SettingsAccountsInstagramAutomationRulesSection = ({
  instagramChannelId,
}: {
  instagramChannelId: string;
}) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const {
    rules,
    loading,
    createRule,
    updateRule,
    setRuleActive,
    deleteRule,
    duplicateRule,
    refetchRules,
  } = useInstagramAutomationRules(instagramChannelId);

  const [flowStep, setFlowStep] = useState<CampaignFlowStep>('list');
  const [editingRule, setEditingRule] = useState<InstagramAutomationRule | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<InstagramCampaignTemplate | null>(null);

  const handleCreateClick = () => {
    setEditingRule(null);
    setSelectedTemplate(null);
    setFlowStep('template-picker');
  };

  const handleEdit = (rule: InstagramAutomationRule) => {
    setEditingRule(rule);
    setSelectedTemplate(null);
    setFlowStep('form');
  };

  const handleSelectTemplate = (template: InstagramCampaignTemplate) => {
    setSelectedTemplate(template);
    setFlowStep('form');
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    setFlowStep('form');
  };

  const handleCancelFlow = () => {
    setFlowStep('list');
    setEditingRule(null);
    setSelectedTemplate(null);
  };

  const handleSubmitForm = async (
    values: SettingsAccountsInstagramCampaignFormValues,
  ) => {
    if (editingRule !== null) {
      // The post/Reel a campaign is attached to is only decided at creation
      // time — editing only touches the automation behavior itself.
      await updateRule({
        id: editingRule.id,
        name: values.name,
        keywords: values.keywords,
        replyMessage: values.replyMessage,
        publicReplyVariations: values.publicReplyVariations,
        requiresFollowToReceiveDm: values.requiresFollowToReceiveDm,
        followUpMessage: values.followUpMessage,
        followUpDelayMinutes: values.followUpDelayMinutes,
      });
      enqueueSuccessSnackBar({ message: t`Campaign updated.` });
    } else {
      await createRule({ instagramChannelId, ...values });
      enqueueSuccessSnackBar({ message: t`Campaign created.` });
    }

    setFlowStep('list');
    setEditingRule(null);
    setSelectedTemplate(null);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateRule(id);
    enqueueSuccessSnackBar({ message: t`Campaign duplicated.` });
  };

  const handleImported = () => {
    refetchRules();
  };

  return (
    <>
      <Section>
        <StyledSectionHeader>
          <H2Title
            title={t`Campaigns`}
            description={t`Comment-to-DM campaigns currently running on your Instagram account.`}
          />
          {flowStep === 'list' && (
            <StyledHeaderActions>
              <SettingsAccountsInstagramCampaignCsvImportButton
                instagramChannelId={instagramChannelId}
                onImported={handleImported}
              />
              <Button
                Icon={IconPlus}
                title={t`New campaign`}
                onClick={handleCreateClick}
                size="small"
                variant="secondary"
              />
            </StyledHeaderActions>
          )}
        </StyledSectionHeader>
        {loading && (
          <SettingsEmptyPlaceholder>{t`Loading campaigns...`}</SettingsEmptyPlaceholder>
        )}
        {!loading && rules.length === 0 && flowStep === 'list' && (
          <SettingsEmptyPlaceholder>{t`No campaign configured yet`}</SettingsEmptyPlaceholder>
        )}
        {rules.length > 0 && (
          <Table>
            <TableRow gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr) auto">
              <TableCell>{t`Campaign`}</TableCell>
              <TableCell>{t`Keywords`}</TableCell>
              <TableCell align="right">{t`Active`}</TableCell>
            </TableRow>
            <StyledTableRows>
              {rules.map((rule) => (
                <SettingsAccountsInstagramAutomationRuleRow
                  key={rule.id}
                  rule={rule}
                  onToggleActive={setRuleActive}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={deleteRule}
                />
              ))}
            </StyledTableRows>
          </Table>
        )}
      </Section>
      {flowStep === 'template-picker' && (
        <SettingsAccountsInstagramCampaignTemplatePicker
          onSelectTemplate={handleSelectTemplate}
          onStartFromScratch={handleStartFromScratch}
          onCancel={handleCancelFlow}
        />
      )}
      {flowStep === 'form' && (
        <SettingsAccountsInstagramCampaignForm
          instagramChannelId={instagramChannelId}
          rule={editingRule}
          template={selectedTemplate}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelFlow}
        />
      )}
    </>
  );
};
