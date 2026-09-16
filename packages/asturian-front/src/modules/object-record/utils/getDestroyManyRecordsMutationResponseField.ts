import { capitalize } from 'zyra-shared/utils';
export const getDestroyManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `destroy${capitalize(objectNamePlural)}`;
