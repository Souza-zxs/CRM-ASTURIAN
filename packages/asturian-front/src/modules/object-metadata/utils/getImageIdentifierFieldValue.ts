import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'zyra-shared/utils';

export const getImageIdentifierFieldValue = (
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
) => {
  if (isDefined(imageIdentifierFieldMetadataItem?.name)) {
    return record[imageIdentifierFieldMetadataItem.name] as string;
  }

  return null;
};
