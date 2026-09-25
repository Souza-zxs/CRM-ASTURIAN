import { type WorkflowSendWhatsappTemplateActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/types/workflow-send-whatsapp-template-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowSendWhatsappTemplateActionSettings =
  BaseWorkflowActionSettings & {
    input: WorkflowSendWhatsappTemplateActionInput;
  };
