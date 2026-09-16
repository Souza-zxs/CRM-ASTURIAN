import { gql } from '@apollo/client';

export const CONNECT_WHATSAPP_NUMBER = gql`
  mutation ConnectWhatsappNumber(
    $code: String!
    $wabaId: String!
    $phoneNumberId: String!
  ) {
    connectWhatsappNumber(
      input: { code: $code, wabaId: $wabaId, phoneNumberId: $phoneNumberId }
    ) {
      whatsappChannelId
      displayPhoneNumber
    }
  }
`;
