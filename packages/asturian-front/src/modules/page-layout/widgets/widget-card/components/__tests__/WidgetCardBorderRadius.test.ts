import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('WidgetCard border radius', () => {
  it('binds the border-radius declaration to the xl radius token, not md', () => {
    const source = readFileSync(
      join(__dirname, '..', 'WidgetCard.tsx'),
      'utf-8',
    );

    const borderRadiusStart = source.indexOf('border-radius: ${');
    expect(borderRadiusStart).toBeGreaterThan(-1);

    const borderRadiusEnd = source.indexOf(';', borderRadiusStart);
    expect(borderRadiusEnd).toBeGreaterThan(borderRadiusStart);

    const borderRadiusDeclaration = source.slice(
      borderRadiusStart,
      borderRadiusEnd,
    );

    expect(borderRadiusDeclaration).toContain('radius.xl');
    expect(borderRadiusDeclaration).not.toContain('radius.md');
  });
});
