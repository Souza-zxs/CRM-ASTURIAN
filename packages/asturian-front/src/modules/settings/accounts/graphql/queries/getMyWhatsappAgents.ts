import { gql } from '@apollo/client';

export const GET_MY_WHATSAPP_AGENTS = gql`
  query MyWhatsappAgents {
    myWhatsappAgents {
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
