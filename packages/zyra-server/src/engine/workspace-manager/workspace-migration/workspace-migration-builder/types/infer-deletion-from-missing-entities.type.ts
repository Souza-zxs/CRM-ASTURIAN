import { type AllMetadataName } from 'zyra-shared/metadata';

export type InferDeletionFromMissingEntities =
  | true
  | Partial<Record<AllMetadataName, boolean>>
  | undefined;
