import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { DELETE_VOICE_AGENT } from '@/settings/accounts/graphql/mutations/voiceAgentMutations';
import { GET_MY_VOICE_AGENTS } from '@/settings/accounts/graphql/queries/getMyVoiceAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useDeleteVoiceAgent = () => {
  const apolloClient = useApolloClient();

  const [deleteVoiceAgentMutation, { loading }] = useMutation<{
    deleteVoiceAgent: VoiceAgent;
  }>(DELETE_VOICE_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_VOICE_AGENTS],
  });

  const deleteVoiceAgent = useCallback(
    async (id: string) => {
      await deleteVoiceAgentMutation({ variables: { id } });
    },
    [deleteVoiceAgentMutation],
  );

  return { deleteVoiceAgent, loading };
};
