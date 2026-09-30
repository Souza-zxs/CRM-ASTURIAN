import { gql } from '@apollo/client';

export const GET_WHATSAPP_CONVERSATIONS = gql`
  query GetWhatsappConversations {
    getWhatsappConversations {
      messageThreadId
      contactPhoneNumber
      contactDisplayName
      personId
      lastMessageBody
      lastMessageReceivedAt
    }
  }
`;
