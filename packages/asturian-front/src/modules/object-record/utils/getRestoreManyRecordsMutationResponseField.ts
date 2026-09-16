import { capitalize } from 'zyra-shared/utils';
export const getRestoreManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `restore${capitalize(objectNamePlural)}`;
