import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { extractPlanTierFromWorkspace } from '@/workspace/utils/extractPlanTierFromWorkspace';
import { type WorkspacePlanTier } from '~/generated-metadata/graphql';

export const useWorkspacePlanTier = (): WorkspacePlanTier => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return extractPlanTierFromWorkspace(currentWorkspace);
};
