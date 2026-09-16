import { capitalize } from 'zyra-shared/utils';
export const getCreateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `create${capitalize(objectNameSingular)}`;
