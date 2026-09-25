import { WorkflowActionType } from 'zyra-shared/workflow';
import {
  type WorkflowAction,
  type WorkflowSendWhatsappTemplateAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowSendWhatsappTemplateAction = (
  action: WorkflowAction,
): action is WorkflowSendWhatsappTemplateAction => {
  return action.type === WorkflowActionType.SEND_WHATSAPP_TEMPLATE;
};
