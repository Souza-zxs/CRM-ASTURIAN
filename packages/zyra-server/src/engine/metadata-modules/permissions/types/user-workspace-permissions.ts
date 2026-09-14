import { type ObjectsPermissions } from 'zyra-shared/types';
import { type PermissionFlagType } from 'zyra-shared/constants';

export type UserWorkspacePermissions = {
  permissionFlags: Record<PermissionFlagType, boolean>;
  objectsPermissions: ObjectsPermissions;
};
