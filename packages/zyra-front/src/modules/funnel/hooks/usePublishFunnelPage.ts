import { type FunnelPage } from '@/funnel/types/FunnelPage';
import {
  PUBLISH_FUNNEL_PAGE,
  UNPUBLISH_FUNNEL_PAGE,
} from '@/funnel/graphql/mutations/funnelPageMutations';
import { GET_FUNNEL_PAGES } from '@/funnel/graphql/queries/getFunnelPages';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const usePublishFunnelPage = () => {
  const apolloClient = useApolloClient();

  const [publishMutation, { loading: publishing }] = useMutation<{
    publishFunnelPage: FunnelPage;
  }>(PUBLISH_FUNNEL_PAGE, {
    client: apolloClient,
    refetchQueries: [GET_FUNNEL_PAGES],
  });

  const [unpublishMutation, { loading: unpublishing }] = useMutation<{
    unpublishFunnelPage: FunnelPage;
  }>(UNPUBLISH_FUNNEL_PAGE, {
    client: apolloClient,
    refetchQueries: [GET_FUNNEL_PAGES],
  });

  const publishFunnelPage = useCallback(
    async (id: string) => {
      await publishMutation({ variables: { id } });
    },
    [publishMutation],
  );

  const unpublishFunnelPage = useCallback(
    async (id: string) => {
      await unpublishMutation({ variables: { id } });
    },
    [unpublishMutation],
  );

  return {
    publishFunnelPage,
    unpublishFunnelPage,
    loading: publishing || unpublishing,
  };
};
