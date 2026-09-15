import { type WhatsappTemplate } from '@/accounts/types/WhatsappTemplate';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyWhatsappTemplates = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myWhatsappTemplates: WhatsappTemplate[];
  }>(GET_MY_WHATSAPP_TEMPLATES, {
    client: apolloClient,
  });

  return {
    whatsappTemplates: data?.myWhatsappTemplates ?? [],
    loading,
  };
};
