import { type FunnelPage, type FunnelPageContent, type FunnelPageType } from '@/funnel/types/FunnelPage';
import { CREATE_FUNNEL_PAGE } from '@/funnel/graphql/mutations/funnelPageMutations';
import { GET_FUNNEL_PAGES } from '@/funnel/graphql/queries/getFunnelPages';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type CreateFunnelPageInput = {
  type: FunnelPageType;
  slug: string;
  content: FunnelPageContent;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const useCreateFunnelPage = () => {
  const apolloClient = useApolloClient();

  const [createFunnelPageMutation, { loading }] = useMutation<{
    createFunnelPage: FunnelPage;
  }>(CREATE_FUNNEL_PAGE, {
    client: apolloClient,
    refetchQueries: [GET_FUNNEL_PAGES],
  });

  const createFunnelPage = useCallback(
    async (input: CreateFunnelPageInput) => {
      await createFunnelPageMutation({ variables: { input } });
    },
    [createFunnelPageMutation],
  );

  return { createFunnelPage, loading };
};
