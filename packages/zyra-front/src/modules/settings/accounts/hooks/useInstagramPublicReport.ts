import { type InstagramPublicReport } from '@/accounts/types/InstagramPublicReport';
import {
  DISABLE_INSTAGRAM_PUBLIC_REPORT,
  ENABLE_INSTAGRAM_PUBLIC_REPORT,
} from '@/settings/accounts/graphql/mutations/instagramPublicReportMutations';
import { GET_INSTAGRAM_PUBLIC_REPORT } from '@/settings/accounts/graphql/queries/getInstagramPublicReport';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useCallback } from 'react';

export const useInstagramPublicReport = (instagramChannelId: string) => {
  const apolloClient = useApolloClient();

  const { data, loading, refetch } = useQuery<{
    instagramPublicReport: InstagramPublicReport | null;
  }>(GET_INSTAGRAM_PUBLIC_REPORT, {
    client: apolloClient,
    variables: { instagramChannelId },
    skip: !instagramChannelId,
  });

  const [enableMutation, { loading: enabling }] = useMutation(
    ENABLE_INSTAGRAM_PUBLIC_REPORT,
    { client: apolloClient },
  );
  const [disableMutation, { loading: disabling }] = useMutation(
    DISABLE_INSTAGRAM_PUBLIC_REPORT,
    { client: apolloClient },
  );

  const enablePublicReport = useCallback(async () => {
    await enableMutation({ variables: { instagramChannelId } });
    await refetch();
  }, [enableMutation, instagramChannelId, refetch]);

  const disablePublicReport = useCallback(async () => {
    await disableMutation({ variables: { instagramChannelId } });
    await refetch();
  }, [disableMutation, instagramChannelId, refetch]);

  return {
    publicReport: data?.instagramPublicReport ?? null,
    loading,
    isMutating: enabling || disabling,
    enablePublicReport,
    disablePublicReport,
  };
};
