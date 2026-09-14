import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/zyra-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageCampaignStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  zyraStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'messageCampaign'>, 'context'>): Record<
  AllStandardObjectIndexName<'messageCampaign'>,
  FlatIndexMetadata
> => ({
  unsubscribeTopicIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'unsubscribeTopicIdIndex',
      relatedFieldNames: ['unsubscribeTopicId'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  listIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'listIdIndex',
      relatedFieldNames: ['list'],
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
