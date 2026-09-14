import { type Nullable } from 'zyra-shared/types';

export type RecordAggregateValueByRecordGroupValue = {
  recordGroupValue: string;
  recordAggregateValue: Nullable<string | number>;
};
