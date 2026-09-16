import { gql } from '@apollo/client';

export const GET_INSTAGRAM_DIAGNOSTICS = gql`
  query InstagramDiagnostics($instagramChannelId: UUID!) {
    instagramDiagnostics(instagramChannelId: $instagramChannelId) {
      lastWebhookReceivedAt
      lastReconciliationAt
      tokenStatus
      pendingJobsCount
      failedJobsCount
    }
  }
`;
