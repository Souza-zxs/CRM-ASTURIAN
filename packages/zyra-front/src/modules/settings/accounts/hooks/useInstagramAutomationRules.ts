import { type InstagramAutomationRule } from '@/accounts/types/InstagramAutomationRule';
import { DUPLICATE_INSTAGRAM_AUTOMATION_RULE } from '@/settings/accounts/graphql/mutations/instagramCampaignActionsMutations';
import { GET_INSTAGRAM_AUTOMATION_RULES } from '@/settings/accounts/graphql/queries/getInstagramAutomationRules';
import {
  CREATE_INSTAGRAM_AUTOMATION_RULE,
  DELETE_INSTAGRAM_AUTOMATION_RULE,
  UPDATE_INSTAGRAM_AUTOMATION_RULE,
} from '@/settings/accounts/graphql/mutations/instagramAutomationRuleMutations';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useCallback } from 'react';

// igMediaId is only required when the campaign targets an existing post;
// it is left undefined/null when attachToNextReel is true.
export type CreateInstagramAutomationRuleInput = {
  instagramChannelId: string;
  name?: string | null;
  igMediaId?: string | null;
  igMediaCaption?: string | null;
  igMediaThumbnailUrl?: string | null;
  igMediaPermalink?: string | null;
  keywords: string[];
  replyMessage: string;
  publicReplyVariations?: string[] | null;
  requiresFollowToReceiveDm?: boolean;
  followUpMessage?: string | null;
  followUpDelayMinutes?: number | null;
  attachToNextReel?: boolean;
};

// Mirrors UpdateInstagramAutomationRuleInput on the server: the post/Reel a
// campaign targets (igMediaId, attachToNextReel) is only decided at creation
// time and cannot be changed afterwards.
export type UpdateInstagramAutomationRuleInput = {
  id: string;
  name?: string | null;
  keywords?: string[];
  replyMessage?: string;
  publicReplyVariations?: string[] | null;
  requiresFollowToReceiveDm?: boolean;
  followUpMessage?: string | null;
  followUpDelayMinutes?: number | null;
  isActive?: boolean;
};

export const useInstagramAutomationRules = (instagramChannelId: string) => {
  const apolloClient = useApolloClient();

  const { data, loading, refetch } = useQuery<{
    instagramAutomationRules: InstagramAutomationRule[];
  }>(GET_INSTAGRAM_AUTOMATION_RULES, {
    client: apolloClient,
    variables: { instagramChannelId },
    skip: !instagramChannelId,
  });

  const [createRuleMutation] = useMutation(CREATE_INSTAGRAM_AUTOMATION_RULE, {
    client: apolloClient,
  });
  const [updateRuleMutation] = useMutation(UPDATE_INSTAGRAM_AUTOMATION_RULE, {
    client: apolloClient,
  });
  const [deleteRuleMutation] = useMutation(DELETE_INSTAGRAM_AUTOMATION_RULE, {
    client: apolloClient,
  });
  const [duplicateRuleMutation] = useMutation(
    DUPLICATE_INSTAGRAM_AUTOMATION_RULE,
    { client: apolloClient },
  );

  const createRule = useCallback(
    async (input: CreateInstagramAutomationRuleInput) => {
      await createRuleMutation({ variables: { input } });
      await refetch();
    },
    [createRuleMutation, refetch],
  );

  const updateRule = useCallback(
    async (input: UpdateInstagramAutomationRuleInput) => {
      await updateRuleMutation({ variables: { input } });
      await refetch();
    },
    [updateRuleMutation, refetch],
  );

  const setRuleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await updateRule({ id, isActive });
    },
    [updateRule],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      await deleteRuleMutation({ variables: { id } });
      await refetch();
    },
    [deleteRuleMutation, refetch],
  );

  const duplicateRule = useCallback(
    async (id: string) => {
      await duplicateRuleMutation({ variables: { id } });
      await refetch();
    },
    [duplicateRuleMutation, refetch],
  );

  return {
    rules: data?.instagramAutomationRules ?? [],
    loading,
    createRule,
    updateRule,
    setRuleActive,
    deleteRule,
    duplicateRule,
    refetchRules: refetch,
  };
};
