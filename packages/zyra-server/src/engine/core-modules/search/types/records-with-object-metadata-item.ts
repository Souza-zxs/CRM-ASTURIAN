import { type ObjectRecord } from 'zyra-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RecordsWithObjectMetadataItem = {
  objectMetadataItem: FlatObjectMetadata;
  records: ObjectRecord[];
};
