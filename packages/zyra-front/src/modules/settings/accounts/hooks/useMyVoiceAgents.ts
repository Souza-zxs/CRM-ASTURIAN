import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { GET_MY_VOICE_AGENTS } from '@/settings/accounts/graphql/queries/getMyVoiceAgents';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyVoiceAgents = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myVoiceAgents: VoiceAgent[];
  }>(GET_MY_VOICE_AGENTS, {
    client: apolloClient,
  });

  return {
    voiceAgents: data?.myVoiceAgents ?? [],
    loading,
  };
};
