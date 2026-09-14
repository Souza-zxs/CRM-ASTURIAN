import type {
  FieldPermissionManifest,
  ObjectPermissionManifest,
  RoleManifest,
} from 'zyra-shared/application';

export type RoleConfig = Omit<
  RoleManifest,
  'objectPermissions' | 'fieldPermissions'
> & {
  objectPermissions?: Omit<ObjectPermissionManifest, 'universalIdentifier'>[];
  fieldPermissions?: Omit<FieldPermissionManifest, 'universalIdentifier'>[];
};
