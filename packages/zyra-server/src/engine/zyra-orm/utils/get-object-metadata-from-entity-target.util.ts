import { type EntityTarget, type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/zyra-orm/interfaces/workspace-internal-context.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ZyraORMException,
  ZyraORMExceptionCode,
} from 'src/engine/zyra-orm/exceptions/zyra-orm.exception';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): FlatObjectMetadata => {
  if (typeof entityTarget !== 'string') {
    throw new ZyraORMException(
      'Entity target must be a string',
      ZyraORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadataName = entityTarget;

  const objectMetadataId =
    internalContext.objectIdByNameSingular[objectMetadataName];

  if (!objectMetadataId) {
    throw new ZyraORMException(
      `Object metadata for object "${objectMetadataName}" is missing ` +
        `in workspace "${internalContext.workspaceId}" ` +
        `with object metadata collection length: ${
          Object.keys(internalContext.objectIdByNameSingular).length
        }`,
      ZyraORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: internalContext.flatObjectMetadataMaps,
  });

  if (!objectMetadata) {
    throw new ZyraORMException(
      `Object metadata for object "${objectMetadataName}" (id: ${objectMetadataId}) is missing`,
      ZyraORMExceptionCode.MALFORMED_METADATA,
    );
  }

  return objectMetadata;
};
