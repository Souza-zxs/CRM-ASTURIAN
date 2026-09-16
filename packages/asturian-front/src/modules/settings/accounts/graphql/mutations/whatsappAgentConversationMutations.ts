import { gql } from '@apollo/client';

export const SET_WHATSAPP_AGENT_CONVERSATION_AI_ENABLED = gql`
  mutation SetWhatsappAgentConversationAiEnabled(
    $id: UUID!
    $isAiEnabled: Boolean!
  ) {
    setWhatsappAgentConversationAiEnabled(id: $id, isAiEnabled: $isAiEnabled) {
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
