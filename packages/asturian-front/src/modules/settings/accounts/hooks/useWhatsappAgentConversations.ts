import { type WhatsappAgentConversation } from '@/accounts/types/WhatsappAgentConversation';
import { GET_WHATSAPP_AGENT_CONVERSATIONS } from '@/settings/accounts/graphql/queries/getWhatsappAgentConversations';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useWhatsappAgentConversations = (
  whatsappAgentId: string | null,
) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    whatsappAgentConversations: WhatsappAgentConversation[];
  }>(GET_WHATSAPP_AGENT_CONVERSATIONS, {
    client: apolloClient,
    variables: { whatsappAgentId },
    skip: !whatsappAgentId,
  });

  return {
    whatsappAgentConversations: data?.whatsappAgentConversations ?? [],
    loading,
  };
};
