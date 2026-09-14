export type InstagramTokenStatus =
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'UNKNOWN';

export type InstagramDiagnostics = {
  lastWebhookReceivedAt: string | null;
  lastReconciliationAt: string | null;
  tokenStatus: InstagramTokenStatus;
  pendingJobsCount: number;
  failedJobsCount: number;
  __typename: 'InstagramDiagnosticsDTO';
};
