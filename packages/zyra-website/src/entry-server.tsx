import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import { localeToUrlSegment, WEBSITE_LOCALE_LIST } from '@/platform/i18n';
import {
  getIndexedWebsiteRoutes,
  getRobotsDisallowedRoutePaths,
  STATIC_WEBSITE_ROUTES,
  WEBSITE_ROUTE_FAMILY_LIST,
} from '@/platform/routing';
import { buildPageMetadata, getSiteUrl } from '@/platform/seo';

import { App } from './App';

// Re-exported for scripts/prerender.mjs: the SSR build (vite build --ssr
// src/entry-server.tsx) is the one place all of this already resolves
// aliases + workspace packages correctly, so the prerender script imports
// its output rather than re-deriving module resolution on its own.
export {
  buildPageMetadata,
  getIndexedWebsiteRoutes,
  getRobotsDisallowedRoutePaths,
  getSiteUrl,
  localeToUrlSegment,
  STATIC_WEBSITE_ROUTES,
  WEBSITE_LOCALE_LIST,
  WEBSITE_ROUTE_FAMILY_LIST,
};

// Used only by scripts/prerender.mjs (never shipped to the browser): renders
// one route's body HTML. <head> metadata is computed separately by the
// prerender script via buildPageMetadata(), not derived from this render.
export const render = (url: string): string =>
  renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
