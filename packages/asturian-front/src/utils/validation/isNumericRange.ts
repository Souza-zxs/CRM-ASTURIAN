import { isDefined } from 'zyra-shared/utils';

export const isNumericRange = (value: string): boolean => {
  return isDefined(value) && /^\d+(-\d+)?$/.test(value);
};
