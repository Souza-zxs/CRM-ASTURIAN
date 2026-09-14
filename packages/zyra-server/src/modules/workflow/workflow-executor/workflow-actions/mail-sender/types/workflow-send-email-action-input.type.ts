import { type EmailAttachment } from 'zyra-shared/types';
import { type EmailRecipients } from 'zyra-shared/workflow';

export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  recipients: EmailRecipients;
  subject?: string;
  body?: string;
  files?: EmailAttachment[];
  inReplyTo?: string;
};
