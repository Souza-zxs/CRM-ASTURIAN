import { type ObjectPermissions } from 'zyra-shared/types';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'permissionFlags' | 'twoFactorAuthenticationMethodSummary'
> & {
  objectsPermissions: Array<ObjectPermissions & { objectMetadataId: string }>;
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
