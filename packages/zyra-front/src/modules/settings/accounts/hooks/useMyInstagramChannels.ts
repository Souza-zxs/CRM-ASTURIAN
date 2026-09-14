import { type InstagramChannel } from '@/accounts/types/InstagramChannel';
import { GET_MY_INSTAGRAM_CHANNELS } from '@/settings/accounts/graphql/queries/getMyInstagramChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyInstagramChannels = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myInstagramChannels: InstagramChannel[];
  }>(GET_MY_INSTAGRAM_CHANNELS, {
    client: apolloClient,
  });

  return {
    channels: data?.myInstagramChannels ?? [],
    loading,
  };
};
