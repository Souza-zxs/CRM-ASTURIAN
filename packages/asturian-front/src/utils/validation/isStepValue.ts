import { isDefined } from 'zyra-shared/utils';

export const isStepValue = (value: string): boolean => {
  return isDefined(value) && value.includes('/');
};
