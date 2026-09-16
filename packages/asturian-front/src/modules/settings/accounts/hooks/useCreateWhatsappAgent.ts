import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { CREATE_WHATSAPP_AGENT } from '@/settings/accounts/graphql/mutations/whatsappAgentMutations';
import { GET_MY_WHATSAPP_AGENTS } from '@/settings/accounts/graphql/queries/getMyWhatsappAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type CreateWhatsappAgentInput = {
  whatsappChannelId: string;
  name: string;
  systemPrompt: string;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  model?: string | null;
};

export const useCreateWhatsappAgent = () => {
  const apolloClient = useApolloClient();

  const [createWhatsappAgentMutation, { loading }] = useMutation<{
    createWhatsappAgent: WhatsappAgent;
  }>(CREATE_WHATSAPP_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_AGENTS],
  });

  const createWhatsappAgent = useCallback(
    async (input: CreateWhatsappAgentInput) => {
      await createWhatsappAgentMutation({ variables: { input } });
    },
    [createWhatsappAgentMutation],
  );

  return { createWhatsappAgent, loading };
};
