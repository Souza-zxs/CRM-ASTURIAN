import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const THEME_CONSTANTS_DIR = join(__dirname, '..');

const readThemeCss = (fileName: string): string =>
  readFileSync(join(THEME_CONSTANTS_DIR, fileName), 'utf-8');

describe('accent color tokens — CRAFTUI blue (#5E81F4 seed)', () => {
  it('theme-light.css uses the blue accent scale', () => {
    const css = readThemeCss('theme-light.css');

    expect(css).toContain('--t-accent-accent9: #5e81f4;');
    expect(css).toContain('--t-accent-accent1: #f5f7fe;');
    expect(css).toContain('--t-accent-accent12: #18254e;');
    expect(css).toContain('--t-accent-primary: #bacafc;');
  });

  it('theme-dark.css uses the blue accent scale', () => {
    const css = readThemeCss('theme-dark.css');

    expect(css).toContain('--t-accent-accent9: #5e81f4;');
    expect(css).toContain('--t-accent-accent1: #0e1325;');
    expect(css).toContain('--t-accent-accent12: #d8e1fd;');
    expect(css).toContain('--t-accent-primary: #213473;');
  });

  it('keeps the light text colors at AA contrast on white', () => {
    const css = readThemeCss('theme-light.css');

    expect(css).toContain('--t-font-color-primary: #1c1d21;');
    expect(css).toContain('--t-font-color-secondary: #6b6b8a;');
  });
});
