import { type AllMetadataName } from 'zyra-shared/metadata';

export const ZYRA_STANDARD_ALL_METADATA_NAME = [
  'index',
  'objectMetadata',
  'fieldMetadata',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewGroup',
  'view',
  'navigationMenuItem',
  'permissionFlag',
  'role',
  'agent',
  'skill',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'commandMenuItem',
] as const satisfies AllMetadataName[];
