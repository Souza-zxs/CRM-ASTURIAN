import { capitalize } from 'zyra-shared/utils';
export const getObjectTypename = (objectNameSingular: string) => {
  return capitalize(objectNameSingular);
};
