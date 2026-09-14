import { gql } from '@apollo/client';

export const GET_MY_INSTAGRAM_CHANNELS = gql`
  query MyInstagramChannels {
    myInstagramChannels {
      id
      connectedAccountId
      igBusinessAccountId
      username
      profilePictureUrl
      isSyncEnabled
      syncStatus
      createdAt
      updatedAt
    }
  }
`;
