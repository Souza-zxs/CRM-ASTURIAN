import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('WidgetCard border radius', () => {
  it('uses the xl radius token for card corners, not md', () => {
    const source = readFileSync(
      join(__dirname, '..', 'WidgetCard.tsx'),
      'utf-8',
    );

    expect(source).toContain('themeCssVariables.border.radius.xl');
    expect(source).not.toContain('themeCssVariables.border.radius.md');
  });
});
