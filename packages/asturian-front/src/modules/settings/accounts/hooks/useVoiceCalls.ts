import { type VoiceCall } from '@/accounts/types/VoiceCall';
import { GET_VOICE_CALLS } from '@/settings/accounts/graphql/queries/getVoiceCalls';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useVoiceCalls = (voiceAgentId: string | null) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    voiceCalls: VoiceCall[];
  }>(GET_VOICE_CALLS, {
    client: apolloClient,
    variables: { voiceAgentId },
    skip: !voiceAgentId,
  });

  return {
    voiceCalls: data?.voiceCalls ?? [],
    loading,
  };
};
