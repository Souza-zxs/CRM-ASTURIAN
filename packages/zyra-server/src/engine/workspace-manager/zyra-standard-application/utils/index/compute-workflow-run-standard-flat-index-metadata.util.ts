import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/zyra-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildWorkflowRunStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  zyraStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'workflowRun'>, 'context'>): Record<
  AllStandardObjectIndexName<'workflowRun'>,
  FlatIndexMetadata
> => ({
  workflowVersionIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowVersionIdIndex',
      relatedFieldNames: ['workflowVersion'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  workflowIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowIdIndex',
      relatedFieldNames: ['workflow'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  searchVectorGinIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'searchVectorGinIndex',
      relatedFieldNames: ['searchVector'],
      indexType: IndexType.GIN,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
});
