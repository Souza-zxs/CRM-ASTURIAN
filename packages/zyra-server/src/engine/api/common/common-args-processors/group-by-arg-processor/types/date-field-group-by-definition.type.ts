import {
  type FirstDayOfTheWeek,
  type ObjectRecordGroupByDateGranularity,
} from 'zyra-shared/types';

export type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};
