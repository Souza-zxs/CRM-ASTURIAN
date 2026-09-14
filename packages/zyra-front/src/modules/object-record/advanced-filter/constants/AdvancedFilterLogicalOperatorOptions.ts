import { RecordFilterGroupLogicalOperator } from 'zyra-shared/types';

export const ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS = [
  {
    value: RecordFilterGroupLogicalOperator.AND,
    label: 'And',
  },
  {
    value: RecordFilterGroupLogicalOperator.OR,
    label: 'Or',
  },
];
