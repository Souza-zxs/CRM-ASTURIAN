import { capitalize } from 'zyra-shared/utils';
export const getCreateManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `create${capitalize(objectNamePlural)}`;
