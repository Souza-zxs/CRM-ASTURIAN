import { gql } from '@apollo/client';

export const CREATE_WHATSAPP_AGENT = gql`
  mutation CreateWhatsappAgent($input: CreateWhatsappAgentInput!) {
    createWhatsappAgent(input: $input) {
      id
      name
      whatsappChannelId
      isActive
      systemPrompt
      greetingMessage
      forbiddenPhrases
      qualificationCriteria
      handoffInstructions
      model
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WHATSAPP_AGENT = gql`
  mutation UpdateWhatsappAgent($input: UpdateWhatsappAgentInput!) {
    updateWhatsappAgent(input: $input) {
      id
      name
      whatsappChannelId
      isActive
      systemPrompt
      greetingMessage
      forbiddenPhrases
      qualificationCriteria
      handoffInstructions
      model
      updatedAt
    }
  }
`;

export const DELETE_WHATSAPP_AGENT = gql`
  mutation DeleteWhatsappAgent($id: UUID!) {
    deleteWhatsappAgent(id: $id) {
      id
    }
  }
`;
