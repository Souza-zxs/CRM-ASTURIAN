import { type InstagramDiagnostics } from '@/accounts/types/InstagramDiagnostics';
import { GET_INSTAGRAM_DIAGNOSTICS } from '@/settings/accounts/graphql/queries/getInstagramDiagnostics';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useInstagramDiagnostics = (instagramChannelId: string) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    instagramDiagnostics: InstagramDiagnostics;
  }>(GET_INSTAGRAM_DIAGNOSTICS, {
    client: apolloClient,
    variables: { instagramChannelId },
    skip: !instagramChannelId,
  });

  return {
    diagnostics: data?.instagramDiagnostics ?? null,
    loading,
  };
};
