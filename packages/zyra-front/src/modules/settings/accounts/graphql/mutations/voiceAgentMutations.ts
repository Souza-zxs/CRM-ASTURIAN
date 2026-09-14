import { gql } from '@apollo/client';

export const CREATE_VOICE_AGENT = gql`
  mutation CreateVoiceAgent($input: CreateVoiceAgentInput!) {
    createVoiceAgent(input: $input) {
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

export const UPDATE_VOICE_AGENT = gql`
  mutation UpdateVoiceAgent($input: UpdateVoiceAgentInput!) {
    updateVoiceAgent(input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_VOICE_AGENT = gql`
  mutation DeleteVoiceAgent($id: UUID!) {
    deleteVoiceAgent(id: $id) {
      id
    }
  }
`;
