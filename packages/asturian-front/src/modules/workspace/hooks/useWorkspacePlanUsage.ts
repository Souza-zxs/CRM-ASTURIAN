import { GET_WORKSPACE_PLAN_MODULES_AND_USAGE } from '@/workspace/graphql/queries/getWorkspacePlanModulesAndUsage';
import {
  type PlanLimitUsage,
  type PlanLimitUsageKey,
} from '@/workspace/types/PlanLimitUsage';
import { useApolloClient, useQuery } from '@apollo/client/react';

type WorkspacePlanModulesAndUsageQueryResult = {
  currentWorkspace: {
    id: string;
    workspacePlanUsage: PlanLimitUsage[];
  };
};

export const useWorkspacePlanUsage = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<WorkspacePlanModulesAndUsageQueryResult>(
    GET_WORKSPACE_PLAN_MODULES_AND_USAGE,
    { client: apolloClient },
  );

  const usage = data?.currentWorkspace.workspacePlanUsage ?? [];

  return {
    usage,
    loading,
    getUsage: (key: PlanLimitUsageKey): PlanLimitUsage | undefined =>
      usage.find((entry) => entry.key === key),
  };
};
