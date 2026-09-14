import { OrderByDirection } from 'zyra-shared/types';

export const isAscendingOrder = (direction: OrderByDirection): boolean =>
  direction === OrderByDirection.AscNullsFirst ||
  direction === OrderByDirection.AscNullsLast;
