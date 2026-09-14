import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { DELETE_WHATSAPP_AGENT } from '@/settings/accounts/graphql/mutations/whatsappAgentMutations';
import { GET_MY_WHATSAPP_AGENTS } from '@/settings/accounts/graphql/queries/getMyWhatsappAgents';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useDeleteWhatsappAgent = () => {
  const apolloClient = useApolloClient();

  const [deleteWhatsappAgentMutation, { loading }] = useMutation<{
    deleteWhatsappAgent: WhatsappAgent;
  }>(DELETE_WHATSAPP_AGENT, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_AGENTS],
  });

  const deleteWhatsappAgent = useCallback(
    async (id: string) => {
      await deleteWhatsappAgentMutation({ variables: { id } });
    },
    [deleteWhatsappAgentMutation],
  );

  return { deleteWhatsappAgent, loading };
};
