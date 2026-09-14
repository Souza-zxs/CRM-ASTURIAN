import { isDefined } from 'zyra-shared/utils';
import { type FullNameMetadata } from 'zyra-shared/types';

export const computeDisplayName = (
  name: FullNameMetadata | null | undefined,
) => {
  if (!name) {
    return '';
  }

  return Object.values(name).filter(isDefined).join(' ');
};
