import { SOURCE_LOCALE, type AppLocale } from 'zyra-shared/translations';

import { LOCALE_BY_URL_SEGMENT } from './locale-by-url-segment';

// Resolves the router's optional :localeSegment param to an AppLocale,
// falling back to the source locale for an absent or unrecognised segment.
// An unrecognised segment simply matches no child route, so the router's
// catch-all handles the 404 case — this never needs to throw.
export const resolveLocaleSegment = (
  segment: string | undefined,
): AppLocale =>
  (segment !== undefined && LOCALE_BY_URL_SEGMENT.get(segment)) ||
  SOURCE_LOCALE;
