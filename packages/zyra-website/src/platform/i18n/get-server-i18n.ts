import { type I18n } from '@lingui/core';

// Module-level holder for the i18n instance of the route currently
// rendering, set by activateRouteI18n. Components that aren't hooked up to
// useLingui() (most section components render outside a component-local
// hook boundary today) read the active instance synchronously through
// getServerI18n() instead.
//
// This is safe as a module global — unlike on a real concurrent server —
// because nothing here renders two locales at once: the browser renders one
// active route at a time, and the SSG prerender script (scripts/prerender.mjs)
// renders pages strictly one after another, never in parallel.
let activeI18n: I18n | null = null;

export const setServerI18n = (i18n: I18n): void => {
  activeI18n = i18n;
};

export const getServerI18n = (): I18n => {
  if (activeI18n) return activeI18n;
  throw new Error(
    'getServerI18n() called before the route i18n context was established. ' +
      'RootLayout must call activateRouteI18n(locale) before rendering children.',
  );
};
