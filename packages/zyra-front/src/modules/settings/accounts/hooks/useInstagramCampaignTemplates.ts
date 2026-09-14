import { type InstagramCampaignTemplate } from '@/accounts/types/InstagramCampaignTemplate';
import { GET_INSTAGRAM_CAMPAIGN_TEMPLATES } from '@/settings/accounts/graphql/queries/getInstagramCampaignTemplates';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useInstagramCampaignTemplates = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    instagramCampaignTemplates: InstagramCampaignTemplate[];
  }>(GET_INSTAGRAM_CAMPAIGN_TEMPLATES, {
    client: apolloClient,
  });

  return {
    templates: data?.instagramCampaignTemplates ?? [],
    loading,
  };
};
