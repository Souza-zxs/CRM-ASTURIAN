import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspacePlanTier } from '~/generated-metadata/graphql';

export const extractPlanTierFromWorkspace = (
  currentWorkspace: CurrentWorkspace | null,
): WorkspacePlanTier => {
  return currentWorkspace?.planTier ?? WorkspacePlanTier.BASIC;
};
