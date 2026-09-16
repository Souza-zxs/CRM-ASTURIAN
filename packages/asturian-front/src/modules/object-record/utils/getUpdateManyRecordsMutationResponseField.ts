import { capitalize } from 'zyra-shared/utils';

export const getUpdateManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `update${capitalize(objectNamePlural)}`;
