import { gql } from '@apollo/client';

export const GET_INSTAGRAM_PUBLIC_REPORT = gql`
  query InstagramPublicReport($instagramChannelId: UUID!) {
    instagramPublicReport(instagramChannelId: $instagramChannelId) {
      id
      instagramChannelId
      shareSlug
      isEnabled
    }
  }
`;
