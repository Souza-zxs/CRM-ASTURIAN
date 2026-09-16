import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'zyra-shared/utils';
import { type InputSchemaProperty } from 'zyra-shared/workflow';
import { type SelectOption } from 'zyra-ui/input';

export const getWorkflowCodeFieldsEnumSelectOptions = (
  property: InputSchemaProperty | undefined,
): SelectOption[] => {
  if (!isDefined(property) || !isNonEmptyArray(property.enum)) {
    return [];
  }

  return property.enum.map((value) => ({
    value,
    label: value,
  }));
};
