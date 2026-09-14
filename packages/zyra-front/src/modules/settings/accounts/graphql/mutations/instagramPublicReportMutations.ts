import { gql } from '@apollo/client';

export const ENABLE_INSTAGRAM_PUBLIC_REPORT = gql`
  mutation EnableInstagramPublicReport($instagramChannelId: UUID!) {
    enableInstagramPublicReport(instagramChannelId: $instagramChannelId) {
      id
      instagramChannelId
      shareSlug
      isEnabled
    }
  }
`;

export const DISABLE_INSTAGRAM_PUBLIC_REPORT = gql`
  mutation DisableInstagramPublicReport($instagramChannelId: UUID!) {
    disableInstagramPublicReport(instagramChannelId: $instagramChannelId) {
      id
      instagramChannelId
      shareSlug
      isEnabled
    }
  }
`;
