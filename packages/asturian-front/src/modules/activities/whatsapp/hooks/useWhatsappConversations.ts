import { useApolloClient, useQuery } from '@apollo/client/react';

import { GET_WHATSAPP_CONVERSATIONS } from '@/activities/whatsapp/graphql/queries/getWhatsappConversations';
import { type GetWhatsappConversationsQuery } from '~/generated-metadata/graphql';

export const useWhatsappConversations = () => {
  // Operacoes de whatsapp vivem no endpoint /metadata (client padrao)
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<GetWhatsappConversationsQuery>(
    GET_WHATSAPP_CONVERSATIONS,
    { client: apolloClient },
  );

  return {
    conversations: data?.getWhatsappConversations ?? [],
    loading,
  };
};
