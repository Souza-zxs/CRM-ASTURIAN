import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowSendWhatsappTemplateActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      whatsappTemplateId: z.string(),
      // Free text or a workflow variable such as {{trigger.phones.primaryPhoneNumber}}.
      to: z.string(),
      // Values for the template's {{1}}, {{2}}... placeholders, in order.
      bodyParameters: z.array(z.string()).optional().default([]),
    }),
  });
