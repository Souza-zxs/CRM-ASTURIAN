import { isObject } from '@sniptt/guards';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'zyra-shared/constants';
import { isDefined } from 'zyra-shared/utils';

const { CONNECT, DISCONNECT } = RELATION_NESTED_QUERY_KEYWORDS;

export const isRelationNestedOperation = (value: unknown): boolean => {
  if (!isObject(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    (CONNECT in obj && isDefined(obj[CONNECT])) ||
    (DISCONNECT in obj && isDefined(obj[DISCONNECT]))
  );
};
