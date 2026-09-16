import { type InstagramFollowerSnapshot } from '@/accounts/types/InstagramFollowerSnapshot';
import { GET_INSTAGRAM_FOLLOWER_HISTORY } from '@/settings/accounts/graphql/queries/getInstagramFollowerHistory';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useInstagramFollowerHistory = (instagramChannelId: string) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    instagramFollowerHistory: InstagramFollowerSnapshot[];
  }>(GET_INSTAGRAM_FOLLOWER_HISTORY, {
    client: apolloClient,
    variables: { instagramChannelId },
    skip: !instagramChannelId,
  });

  return {
    followerHistory: data?.instagramFollowerHistory ?? [],
    loading,
  };
};
