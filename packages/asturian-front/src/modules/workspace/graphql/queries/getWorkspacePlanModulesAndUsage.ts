import { gql } from '@apollo/client';

export const GET_WORKSPACE_PLAN_MODULES_AND_USAGE = gql`
  query WorkspacePlanModulesAndUsage {
    currentWorkspace {
      id
      workspaceModules {
        module
        quantity
        hasAccess
        implemented
      }
      workspacePlanUsage {
        key
        used
        limit
      }
    }
  }
`;
