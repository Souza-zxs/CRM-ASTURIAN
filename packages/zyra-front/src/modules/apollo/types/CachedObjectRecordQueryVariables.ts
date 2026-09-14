import { type RecordGqlOperationVariables } from 'zyra-shared/types';

export type CachedObjectRecordQueryVariables = Omit<
  RecordGqlOperationVariables,
  'limit'
> & { first?: RecordGqlOperationVariables['limit'] };
