import { type RecordGqlOperationSignature } from 'zyra-shared/types';

export type RecordGqlOperationSignatureFactory<FactoryParams extends object> = (
  factoryParams: FactoryParams,
) => RecordGqlOperationSignature;
