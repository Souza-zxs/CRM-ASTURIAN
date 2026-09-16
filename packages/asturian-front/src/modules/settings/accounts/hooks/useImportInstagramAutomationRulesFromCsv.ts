import { type InstagramAutomationRule } from '@/accounts/types/InstagramAutomationRule';
import { IMPORT_INSTAGRAM_AUTOMATION_RULES_FROM_CSV } from '@/settings/accounts/graphql/mutations/instagramCampaignActionsMutations';
import { GET_INSTAGRAM_AUTOMATION_RULES } from '@/settings/accounts/graphql/queries/getInstagramAutomationRules';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;

    reader.readAsText(file);
  });

export const useImportInstagramAutomationRulesFromCsv = (
  instagramChannelId: string,
) => {
  const apolloClient = useApolloClient();

  const [importRulesMutation, { loading }] = useMutation<{
    importInstagramAutomationRulesFromCsv: InstagramAutomationRule[];
  }>(IMPORT_INSTAGRAM_AUTOMATION_RULES_FROM_CSV, {
    client: apolloClient,
    refetchQueries: [
      { query: GET_INSTAGRAM_AUTOMATION_RULES, variables: { instagramChannelId } },
    ],
  });

  const importRulesFromFile = useCallback(
    async (file: File) => {
      const csvContent = await readFileAsText(file);

      const { data } = await importRulesMutation({
        variables: { instagramChannelId, csvContent },
      });

      return data?.importInstagramAutomationRulesFromCsv ?? [];
    },
    [importRulesMutation, instagramChannelId],
  );

  return { importRulesFromFile, loading };
};
