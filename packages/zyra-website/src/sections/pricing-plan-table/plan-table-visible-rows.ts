import { type PlanTableBodyRowDataType } from './plan-table-types';

// Drops any category band that would otherwise be followed by nothing but
// another category (or the end of the list) — e.g. once feature rows under
// it have been filtered out elsewhere.
export function resolveVisibleRows(
  rows: readonly PlanTableBodyRowDataType[],
): PlanTableBodyRowDataType[] {
  return rows.filter((row, index) => {
    if (row.type !== 'category') {
      return true;
    }

    const next = rows
      .slice(index + 1)
      .find(
        (candidate) =>
          candidate.type === 'category' || candidate.type === 'row',
      );

    return next !== undefined && next.type !== 'category';
  });
}
