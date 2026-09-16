import { capitalize } from 'zyra-shared/utils';

export const getGroupByAggregateQueryName = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  return `${capitalize(objectMetadataNamePlural)}GroupByAggregates`;
};
