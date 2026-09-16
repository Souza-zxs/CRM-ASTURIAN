import { DEFAULT_VISIBLE_ADDRESS_SUBFIELDS } from 'zyra-shared/constants';
import {
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'zyra-shared/types';
import { isNonEmptyArray } from 'zyra-shared/utils';

export const getEnabledAddressSubFields = (
  settings:
    | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
    | null
    | undefined,
): readonly AllowedAddressSubField[] => {
  if (isNonEmptyArray(settings?.subFields)) {
    return settings.subFields;
  }
  return DEFAULT_VISIBLE_ADDRESS_SUBFIELDS;
};
