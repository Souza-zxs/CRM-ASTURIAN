import { gql } from '@apollo/client';

export const GET_WHATSAPP_AGENT_CONVERSATIONS = gql`
  query WhatsappAgentConversations($whatsappAgentId: UUID!) {
    whatsappAgentConversations(whatsappAgentId: $whatsappAgentId) {
      id
      whatsappAgentId
      contactPhoneNumber
      isAiEnabled
      qualificationSummary
      lastMessageAt
      createdAt
    }
  }
`;
