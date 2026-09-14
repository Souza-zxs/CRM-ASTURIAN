import { type ObjectRecord as SharedObjectRecord } from 'zyra-shared/types';

export type BaseObjectRecord = SharedObjectRecord & {
  __typename: string;
};
