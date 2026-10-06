import { GET_WORKSPACE_PLAN_MODULES_AND_USAGE } from '@/workspace/graphql/queries/getWorkspacePlanModulesAndUsage';
import {
  type WorkspaceModule,
  type WorkspaceModuleEntitlement,
} from '@/workspace/types/WorkspaceModuleEntitlement';
import { useApolloClient, useQuery } from '@apollo/client/react';

type WorkspacePlanModulesAndUsageQueryResult = {
  currentWorkspace: {
    id: string;
    workspaceModules: WorkspaceModuleEntitlement[];
  };
};

export const useWorkspaceModules = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<WorkspacePlanModulesAndUsageQueryResult>(
    GET_WORKSPACE_PLAN_MODULES_AND_USAGE,
    { client: apolloClient },
  );

  const modules = data?.currentWorkspace.workspaceModules ?? [];

  return {
    modules,
    loading,
    hasModule: (module: WorkspaceModule): boolean =>
      modules.find((entitlement) => entitlement.module === module)
        ?.hasAccess ?? false,
  };
};
