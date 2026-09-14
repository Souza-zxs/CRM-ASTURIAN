import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
import { CREATE_VOICE_AGENT } from '@/settings/accounts/graphql/mutations/voiceAgentMutations';
import { GET_MY_VOICE_AGENTS } from '@/settings/accounts/graphql/queries/getMyVoiceAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type CreateVoiceAgentInput = {
  name: string;
  systemPrompt: string;
  phoneNumber?: string | null;
  voice?: string | null;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  transferPhoneNumber?: string | null;
};

export const useCreateVoiceAgent = () => {
  const apolloClient = useApolloClient();

  const [createVoiceAgentMutation, { loading }] = useMutation<{
    createVoiceAgent: VoiceAgent;
  }>(CREATE_VOICE_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_VOICE_AGENTS],
  });

  const createVoiceAgent = useCallback(
    async (input: CreateVoiceAgentInput) => {
      await createVoiceAgentMutation({ variables: { input } });
    },
    [createVoiceAgentMutation],
  );

  return { createVoiceAgent, loading };
};
