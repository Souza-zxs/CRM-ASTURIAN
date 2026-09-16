import { gql } from '@apollo/client';

export const GET_INSTAGRAM_FOLLOWER_HISTORY = gql`
  query InstagramFollowerHistory($instagramChannelId: UUID!) {
    instagramFollowerHistory(instagramChannelId: $instagramChannelId) {
      id
      followerCount
      capturedAt
    }
  }
`;
