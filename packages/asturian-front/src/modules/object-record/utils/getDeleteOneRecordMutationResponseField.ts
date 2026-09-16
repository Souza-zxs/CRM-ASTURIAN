import { capitalize } from 'zyra-shared/utils';
export const getDeleteOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `delete${capitalize(objectNameSingular)}`;
