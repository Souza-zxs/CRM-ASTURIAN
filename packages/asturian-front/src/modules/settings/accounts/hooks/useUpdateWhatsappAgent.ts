import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { UPDATE_WHATSAPP_AGENT } from '@/settings/accounts/graphql/mutations/whatsappAgentMutations';
import { GET_MY_WHATSAPP_AGENTS } from '@/settings/accounts/graphql/queries/getMyWhatsappAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type UpdateWhatsappAgentInput = {
  id: string;
  name?: string;
  isActive?: boolean;
  systemPrompt?: string;
  greetingMessage?: string | null;
  forbiddenPhrases?: string[] | null;
  qualificationCriteria?: string | null;
  handoffInstructions?: string | null;
  model?: string | null;
};

export const useUpdateWhatsappAgent = () => {
  const apolloClient = useApolloClient();

  const [updateWhatsappAgentMutation, { loading }] = useMutation<{
    updateWhatsappAgent: WhatsappAgent;
  }>(UPDATE_WHATSAPP_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_AGENTS],
  });

  const updateWhatsappAgent = useCallback(
    async (input: UpdateWhatsappAgentInput) => {
      await updateWhatsappAgentMutation({ variables: { input } });
    },
    [updateWhatsappAgentMutation],
  );

  return { updateWhatsappAgent, loading };
};
