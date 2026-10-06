import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'zyra-shared/translations';

// THE source of deployed website locales: URL segments, generateStaticParams,
// next.config rewrites, hreflang, and the sitemap all derive from this list.
// Adding a locale here fails the build until its compiled catalog is imported
// in messages-by-locale.ts.
// NOTE: prerender.mjs treats this list's FIRST entry as the unprefixed root
// locale, while localize-href.ts and build-page-metadata.ts independently key
// off the shared SOURCE_LOCALE constant ('en'). Keep SOURCE_LOCALE first here
// so both definitions agree — reordering this without reconciling those two
// files produces mismatched canonical/hreflang URLs.
export const WEBSITE_LOCALE_LIST: readonly AppLocale[] = [
  SOURCE_LOCALE,
  APP_LOCALES['pt-BR'],
  APP_LOCALES['fr-FR'],
  APP_LOCALES['es-ES'],
];
