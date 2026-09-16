import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand as RecordFilterOperand,
} from 'zyra-shared/types';
import { getFilterOperandsForFilterableFieldType } from 'zyra-shared/utils';

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
}): readonly RecordFilterOperand[] => {
  return getFilterOperandsForFilterableFieldType({
    filterType,
    subFieldName,
  });
};
