import { capitalize } from 'zyra-shared/utils';
export const getDestroyOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `destroy${capitalize(objectNameSingular)}`;
