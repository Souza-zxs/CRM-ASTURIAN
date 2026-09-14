import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { GET_MY_WHATSAPP_AGENTS } from '@/settings/accounts/graphql/queries/getMyWhatsappAgents';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyWhatsappAgents = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myWhatsappAgents: WhatsappAgent[];
  }>(GET_MY_WHATSAPP_AGENTS, {
    client: apolloClient,
  });

  return {
    whatsappAgents: data?.myWhatsappAgents ?? [],
    loading,
  };
};
