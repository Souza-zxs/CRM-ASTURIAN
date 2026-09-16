import { type WhatsappAgentConversation } from '@/accounts/types/WhatsappAgentConversation';
import { SET_WHATSAPP_AGENT_CONVERSATION_AI_ENABLED } from '@/settings/accounts/graphql/mutations/whatsappAgentConversationMutations';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useSetWhatsappAgentConversationAiEnabled = () => {
  const apolloClient = useApolloClient();

  const [setWhatsappAgentConversationAiEnabledMutation, { loading }] =
    useMutation<{
      setWhatsappAgentConversationAiEnabled: WhatsappAgentConversation;
    }>(SET_WHATSAPP_AGENT_CONVERSATION_AI_ENABLED, {
      client: apolloClient,
    });

  const setWhatsappAgentConversationAiEnabled = useCallback(
    async (id: string, isAiEnabled: boolean) => {
      await setWhatsappAgentConversationAiEnabledMutation({
        variables: { id, isAiEnabled },
      });
    },
    [setWhatsappAgentConversationAiEnabledMutation],
  );

  return { setWhatsappAgentConversationAiEnabled, loading };
};
