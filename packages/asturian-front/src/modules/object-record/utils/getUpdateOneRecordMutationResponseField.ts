import { capitalize } from 'zyra-shared/utils';
export const getUpdateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `update${capitalize(objectNameSingular)}`;
