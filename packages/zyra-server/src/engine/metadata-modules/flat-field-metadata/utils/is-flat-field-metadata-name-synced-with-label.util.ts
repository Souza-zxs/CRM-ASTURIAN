import { computeMetadataNameFromLabel } from 'zyra-shared/metadata';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCallerZyraStandardApp } from 'src/engine/metadata-modules/utils/is-caller-zyra-standard-app.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const isFlatFieldMetadataNameSyncedWithLabel = ({
  flatFieldMetadata,
  buildOptions,
}: {
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'name' | 'isLabelSyncedWithName' | 'label'
  >;
  buildOptions: WorkspaceMigrationBuilderOptions;
}) => {
  const computedName = computeMetadataNameFromLabel({
    label: flatFieldMetadata.label,
    applyCustomSuffix: !isCallerZyraStandardApp(buildOptions),
  });

  return flatFieldMetadata.name === computedName;
};
