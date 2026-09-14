import { RATING_VALUES } from 'zyra-shared/constants';
import { type FieldRatingValue } from 'zyra-shared/types';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
