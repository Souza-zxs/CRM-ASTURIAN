import { type FunnelPage, type FunnelPageContent } from '@/funnel/types/FunnelPage';
import { UPDATE_FUNNEL_PAGE } from '@/funnel/graphql/mutations/funnelPageMutations';
import { GET_FUNNEL_PAGES } from '@/funnel/graphql/queries/getFunnelPages';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type UpdateFunnelPageInput = {
  id: string;
  slug?: string;
  content?: FunnelPageContent;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const useUpdateFunnelPage = () => {
  const apolloClient = useApolloClient();

  const [updateFunnelPageMutation, { loading }] = useMutation<{
    updateFunnelPage: FunnelPage;
  }>(UPDATE_FUNNEL_PAGE, {
    client: apolloClient,
    refetchQueries: [GET_FUNNEL_PAGES],
  });

  const updateFunnelPage = useCallback(
    async (input: UpdateFunnelPageInput) => {
      await updateFunnelPageMutation({ variables: { input } });
    },
    [updateFunnelPageMutation],
  );

  return { updateFunnelPage, loading };
};
