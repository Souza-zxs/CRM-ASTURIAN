import { gql } from '@apollo/client';

export const GET_INSTAGRAM_RECENT_MEDIA = gql`
  query InstagramRecentMedia($instagramChannelId: UUID!) {
    instagramRecentMedia(instagramChannelId: $instagramChannelId) {
      id
      caption
      thumbnailUrl
      permalink
    }
  }
`;
