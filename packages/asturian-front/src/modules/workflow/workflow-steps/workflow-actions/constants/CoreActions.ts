import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { DRAFT_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DraftEmailAction';
import { HTTP_REQUEST_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/HttpRequestAction';
import { SEND_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendEmailAction';
import { SEND_WHATSAPP_TEMPLATE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendWhatsappTemplateAction';

export const CORE_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<
    WorkflowActionType,
    | 'CODE'
    | 'SEND_EMAIL'
    | 'DRAFT_EMAIL'
    | 'SEND_WHATSAPP_TEMPLATE'
    | 'HTTP_REQUEST'
  >;
  icon: string;
}> = [
  SEND_EMAIL_ACTION,
  DRAFT_EMAIL_ACTION,
  SEND_WHATSAPP_TEMPLATE_ACTION,
  CODE_ACTION,
  HTTP_REQUEST_ACTION,
];
