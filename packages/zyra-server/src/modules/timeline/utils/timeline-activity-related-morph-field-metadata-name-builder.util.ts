import { capitalize } from 'zyra-shared/utils';

export const buildTimelineActivityRelatedMorphFieldMetadataName = (
  name: string,
) => {
  return `target${capitalize(name)}`;
};
