import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SettingsMultiWorkspaceOnlyRouteProps = {
  children: ReactNode;
};

// Subdomain and custom-domain settings only make sense when several workspaces
// share the instance; with a single workspace they are dead ends, so anyone
// reaching them by URL is sent back to the general workspace settings.
export const SettingsMultiWorkspaceOnlyRoute = ({
  children,
}: SettingsMultiWorkspaceOnlyRouteProps) => {
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  if (!isMultiWorkspaceEnabled) {
    return <Navigate to={getSettingsPath(SettingsPath.General)} replace />;
  }

  return <>{children}</>;
};
