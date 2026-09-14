import { gql } from '@apollo/client';

export const GET_VOICE_CALLS = gql`
  query VoiceCalls($voiceAgentId: UUID!) {
    voiceCalls(voiceAgentId: $voiceAgentId) {
      id
      voiceAgentId
      twilioCallSid
      direction
      status
      fromNumber
      toNumber
      startedAt
      endedAt
      durationSeconds
      transcript
      summary
      createdAt
    }
  }
`;
