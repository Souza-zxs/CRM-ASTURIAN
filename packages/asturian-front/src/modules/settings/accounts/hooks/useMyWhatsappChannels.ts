import { type WhatsappChannel } from '@/accounts/types/WhatsappChannel';
import { GET_MY_WHATSAPP_CHANNELS } from '@/settings/accounts/graphql/queries/getMyWhatsappChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyWhatsappChannels = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myWhatsappChannels: WhatsappChannel[];
  }>(GET_MY_WHATSAPP_CHANNELS, {
    client: apolloClient,
  });

  return {
    channels: data?.myWhatsappChannels ?? [],
    loading,
  };
};
