import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/zyra-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageParticipantStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  zyraStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'messageParticipant'>, 'context'>): Record<
  AllStandardObjectIndexName<'messageParticipant'>,
  FlatIndexMetadata
> => ({
  messageIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'messageIdIndex',
      relatedFieldNames: ['message'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  personIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'personIdIndex',
      relatedFieldNames: ['person'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  workspaceMemberIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workspaceMemberIdIndex',
      relatedFieldNames: ['workspaceMember'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  messageCampaignIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'messageCampaignIdIndex',
      relatedFieldNames: ['messageCampaign'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
});
