import { ZYRA_STANDARD_APPLICATION } from 'src/engine/workspace-manager/zyra-standard-application/constants/zyra-standard-applications';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const isCallerZyraStandardApp = (
  buildOptions: WorkspaceMigrationBuilderOptions,
) =>
  buildOptions.applicationUniversalIdentifier ===
  ZYRA_STANDARD_APPLICATION.universalIdentifier;
