import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { UPDATE_VOICE_AGENT } from '@/settings/accounts/graphql/mutations/voiceAgentMutations';
import { GET_MY_VOICE_AGENTS } from '@/settings/accounts/graphql/queries/getMyVoiceAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type UpdateVoiceAgentInput = {
  id: string;
  name?: string;
  isActive?: boolean;
  phoneNumber?: string | null;
  voice?: string;
  systemPrompt?: string;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  transferPhoneNumber?: string | null;
};

export const useUpdateVoiceAgent = () => {
  const apolloClient = useApolloClient();

  const [updateVoiceAgentMutation, { loading }] = useMutation<{
    updateVoiceAgent: VoiceAgent;
  }>(UPDATE_VOICE_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_VOICE_AGENTS],
  });

  const updateVoiceAgent = useCallback(
    async (input: UpdateVoiceAgentInput) => {
      await updateVoiceAgentMutation({ variables: { input } });
    },
    [updateVoiceAgentMutation],
  );

  return { updateVoiceAgent, loading };
};
