import { msg } from '@lingui/core/macro';

import { type PlanTableCellType } from './plan-table-types';
import { resolveVisibleRows } from './plan-table-visible-rows';

const yes: PlanTableCellType = { kind: 'yes' };

describe('resolveVisibleRows', () => {
  it('drops a category left with no rows beneath it', () => {
    const rows = resolveVisibleRows([
      { title: msg`empty`, type: 'category' },
      { title: msg`kept`, type: 'category' },
      {
        featureLabel: msg`feature`,
        tiers: { organization: yes, pro: yes },
        type: 'row',
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0].type).toBe('category');
    expect(rows[1].type).toBe('row');
  });
});
