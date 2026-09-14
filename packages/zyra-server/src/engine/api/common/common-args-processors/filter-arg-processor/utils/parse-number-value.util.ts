import { FieldMetadataType } from 'zyra-shared/types';
import { assertUnreachable } from 'zyra-shared/utils';

export const parseNumberValue = (
  value: unknown,
  fieldType:
    | FieldMetadataType.NUMBER
    | FieldMetadataType.NUMERIC
    | FieldMetadataType.POSITION,
): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  switch (fieldType) {
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return parseFloat(value);

    default:
      assertUnreachable(fieldType);
  }
};
