import { useApolloClient, useQuery } from '@apollo/client/react';

import { GET_WHATSAPP_THREAD_ID_FOR_PERSON } from '@/activities/whatsapp/graphql/queries/getWhatsappThreadIdForPerson';
import { useWhatsappThreadMessages } from '@/activities/whatsapp/hooks/useWhatsappThreadMessages';

export const useWhatsappThreadForPerson = (personId: string) => {
  // Operacoes de whatsapp vivem no endpoint /metadata (client padrao)
  const apolloClient = useApolloClient();

  const { data, loading: threadIdLoading } = useQuery<{
    getWhatsappThreadIdForPerson: string | null;
  }>(GET_WHATSAPP_THREAD_ID_FOR_PERSON, {
    client: apolloClient,
    variables: { personId },
    skip: !personId,
  });

  const messageThreadId = data?.getWhatsappThreadIdForPerson ?? null;

  const { messages, loading: messagesLoading } =
    useWhatsappThreadMessages(messageThreadId);

  return {
    messageThreadId,
    messages,
    loading: threadIdLoading || messagesLoading,
  };
};
