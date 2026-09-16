import { isDefined } from 'zyra-shared/utils';

export const isListValue = (value: string): boolean => {
  return isDefined(value) && value.includes(',');
};
