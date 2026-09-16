import { gql } from '@apollo/client';

export const GET_MY_VOICE_AGENTS = gql`
  query MyVoiceAgents {
    myVoiceAgents {
      id
      name
      isActive
      phoneNumber
      voice
      systemPrompt
      greetingMessage
      forbiddenPhrases
      qualificationCriteria
      handoffInstructions
      transferPhoneNumber
      createdAt
      updatedAt
    }
  }
`;
