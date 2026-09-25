import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const SEND_WHATSAPP_TEMPLATE_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'SEND_WHATSAPP_TEMPLATE'>;
  icon: string;
} = {
  defaultLabel: 'Send WhatsApp Template',
  type: 'SEND_WHATSAPP_TEMPLATE',
  icon: 'IconBrandWhatsapp',
};
