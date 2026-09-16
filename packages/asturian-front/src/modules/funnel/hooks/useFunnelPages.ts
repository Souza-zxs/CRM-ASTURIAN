import { type FunnelPage } from '@/funnel/types/FunnelPage';
import { GET_FUNNEL_PAGES } from '@/funnel/graphql/queries/getFunnelPages';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useFunnelPages = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    funnelPages: FunnelPage[];
  }>(GET_FUNNEL_PAGES, {
    client: apolloClient,
  });

  return {
    funnelPages: data?.funnelPages ?? [],
    loading,
  };
};
