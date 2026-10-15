import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const THEME_CONSTANTS_DIR = join(__dirname, '..');

const readThemeCss = (fileName: string): string =>
  readFileSync(join(THEME_CONSTANTS_DIR, fileName), 'utf-8');

describe('accent color tokens — rebrand to vivid violet (#6E56CF seed)', () => {
  it('theme-light.css uses the new accent9/accent1/accent12 values', () => {
    const css = readThemeCss('theme-light.css');

    expect(css).toContain(
      '--t-accent-accent9: color(display-p3 0.431 0.337 0.812);',
    );
    expect(css).toContain(
      '--t-accent-accent1: color(display-p3 0.985 0.983 1);',
    );
    expect(css).toContain(
      '--t-accent-accent12: color(display-p3 0.124 0.069 0.29);',
    );
    expect(css).toContain(
      '--t-accent-primary: color(display-p3 0.431 0.337 0.812);',
    );
  });

  it('theme-dark.css uses the new accent9/accent1/accent12 values', () => {
    const css = readThemeCss('theme-dark.css');

    expect(css).toContain(
      '--t-accent-accent9: color(display-p3 0.565 0.485 0.973);',
    );
    expect(css).toContain(
      '--t-accent-accent1: color(display-p3 0.06 0.032 0.158);',
    );
    expect(css).toContain(
      '--t-accent-accent12: color(display-p3 0.911 0.899 1);',
    );
    expect(css).toContain(
      '--t-accent-primary: color(display-p3 0.565 0.485 0.973);',
    );
  });
});
