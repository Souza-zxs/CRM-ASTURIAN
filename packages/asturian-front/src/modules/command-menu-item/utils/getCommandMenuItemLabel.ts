import { i18n, type MessageDescriptor } from '@lingui/core';
import { isString } from '@sniptt/guards';
import { type Nullable } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

export const getCommandMenuItemLabel = (
  label: Nullable<string | MessageDescriptor>,
): string => {
  if (!isDefined(label)) {
    return '';
  }

  return isString(label) ? label : i18n._(label);
};
