import { DELETE_FUNNEL_PAGE } from '@/funnel/graphql/mutations/funnelPageMutations';
import { GET_FUNNEL_PAGES } from '@/funnel/graphql/queries/getFunnelPages';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useDeleteFunnelPage = () => {
  const apolloClient = useApolloClient();

  const [deleteFunnelPageMutation, { loading }] = useMutation<{
    deleteFunnelPage: boolean;
  }>(DELETE_FUNNEL_PAGE, {
    client: apolloClient,
    refetchQueries: [GET_FUNNEL_PAGES],
  });

  const deleteFunnelPage = useCallback(
    async (id: string) => {
      await deleteFunnelPageMutation({ variables: { id } });
    },
    [deleteFunnelPageMutation],
  );

  return { deleteFunnelPage, loading };
};
