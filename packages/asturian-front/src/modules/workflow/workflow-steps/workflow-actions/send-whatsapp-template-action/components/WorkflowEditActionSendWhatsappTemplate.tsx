import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyWhatsappTemplates } from '@/settings/accounts/hooks/useMyWhatsappTemplates';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowSendWhatsappTemplateAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { type SelectOption } from 'zyra-ui/input';

const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\d+\}\}/g;

type WorkflowEditActionSendWhatsappTemplateProps = {
  action: WorkflowSendWhatsappTemplateAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendWhatsappTemplateAction) => void;
      };
};

export const WorkflowEditActionSendWhatsappTemplate = ({
  action,
  actionOptions,
}: WorkflowEditActionSendWhatsappTemplateProps) => {
  const { whatsappTemplates } = useMyWhatsappTemplates();

  const { whatsappTemplateId, to, bodyParameters } = action.settings.input;

  // Meta only accepts approved templates, so only those are offered — but the
  // template already chosen stays listed, or the select would look empty for a
  // step whose template was later rejected or is still pending.
  const templateOptions: SelectOption<string>[] = whatsappTemplates
    .filter(
      (whatsappTemplate) =>
        whatsappTemplate.status === 'APPROVED' ||
        whatsappTemplate.id === whatsappTemplateId,
    )
    .map((whatsappTemplate) => ({
      label: `${whatsappTemplate.name} (${whatsappTemplate.language})`,
      value: whatsappTemplate.id,
    }));

  const selectedTemplate = whatsappTemplates.find(
    (whatsappTemplate) => whatsappTemplate.id === whatsappTemplateId,
  );

  // One input per distinct {{n}} placeholder in the template's body, so the
  // user fills exactly what Meta expects.
  const placeholderCount = new Set(
    selectedTemplate?.bodyText.match(TEMPLATE_PLACEHOLDER_PATTERN) ?? [],
  ).size;

  const updateInput = (
    partialInput: Partial<
      WorkflowSendWhatsappTemplateAction['settings']['input']
    >,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: { ...action.settings.input, ...partialInput },
      },
    });
  };

  const handleBodyParameterChange = (index: number, value: string) => {
    const nextBodyParameters = Array.from(
      { length: placeholderCount },
      (_, parameterIndex) => bodyParameters[parameterIndex] ?? '',
    );

    nextBodyParameters[index] = value;

    updateInput({ bodyParameters: nextBodyParameters });
  };

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-send-whatsapp-template-template"
          label={t`Template`}
          options={templateOptions}
          dropdownWidth={GenericDropdownContentWidth.Large}
          value={whatsappTemplateId === '' ? undefined : whatsappTemplateId}
          onChange={(value) =>
            // A new template has its own placeholders, so old values are dropped.
            updateInput({ whatsappTemplateId: value, bodyParameters: [] })
          }
          disabled={actionOptions.readonly}
          emptyOption={{ label: t`Select a template`, value: '' }}
          withSearchInput
        />
        <FormTextFieldInput
          label={t`To (phone number)`}
          placeholder={t`Type a number or pick a variable`}
          defaultValue={to}
          onChange={(value) => updateInput({ to: value })}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        {Array.from({ length: placeholderCount }, (_, index) => (
          <FormTextFieldInput
            // The index is the identity here: {{1}}, {{2}}... are positional.
            key={`${whatsappTemplateId}-${index}`}
            label={t`Value for {{${index + 1}}}`}
            placeholder={t`Type a value or pick a variable`}
            defaultValue={bodyParameters[index]}
            onChange={(value) => handleBodyParameterChange(index, value)}
            readonly={actionOptions.readonly}
            VariablePicker={WorkflowVariablePicker}
          />
        ))}
      </WorkflowStepBody>

      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
