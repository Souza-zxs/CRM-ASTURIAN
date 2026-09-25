import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendWhatsappTemplateActionSettingsSchema } from './send-whatsapp-template-action-settings-schema';

export const workflowSendWhatsappTemplateActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('SEND_WHATSAPP_TEMPLATE'),
    settings: workflowSendWhatsappTemplateActionSettingsSchema,
  });
