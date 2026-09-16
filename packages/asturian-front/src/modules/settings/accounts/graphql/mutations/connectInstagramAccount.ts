import { gql } from '@apollo/client';

export const CONNECT_INSTAGRAM_ACCOUNT = gql`
  mutation ConnectInstagramAccount($code: String!) {
    connectInstagramAccount(input: { code: $code }) {
      instagramChannelId
      username
    }
  }
`;
