import { isNull } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const computeRecordGroupOptionsFilter = ({
  recordGroupFieldMetadata,
  recordGroupValues,
}: {
  recordGroupFieldMetadata: FieldMetadataItem | null | undefined;
  recordGroupValues: RecordGroupDefinition['value'][];
}): RecordGqlOperationFilter => {
  if (!isDefined(recordGroupFieldMetadata) || recordGroupValues.length === 0) {
    return {};
  }

  const fieldName = recordGroupFieldMetadata.name;
  const hasNullValue = recordGroupValues.some(isNull);
  const nonNullValues = recordGroupValues.filter(
    (value): value is NonNullable<typeof value> => !isNull(value),
  );

  return hasNullValue
    ? {
        or: [
          { [fieldName]: { is: 'NULL' } },
          ...(nonNullValues.length > 0
            ? [{ [fieldName]: { in: nonNullValues } }]
            : []),
        ],
      }
    : nonNullValues.length > 0
      ? {
          [fieldName]: { in: recordGroupValues },
        }
      : {};
};
