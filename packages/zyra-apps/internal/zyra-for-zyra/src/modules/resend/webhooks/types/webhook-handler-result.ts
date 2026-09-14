type WebhookSkippedResult = {
  skipped: true;
  reason: string;
};

type WebhookErrorResult = {
  error: string;
};

type WebhookSyncedResult = {
  action: 'created' | 'updated' | 'deleted';
  zyraId?: string;
  resendId: string;
  personId?: string;
  lastEvent?: string;
};

export type WebhookHandlerResult =
  | WebhookSkippedResult
  | WebhookErrorResult
  | WebhookSyncedResult;
