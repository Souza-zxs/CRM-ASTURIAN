import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import { fetchLiveMarketplacePartners } from '@/partners-marketplace/fetch-live-marketplace-partners';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { localeToUrlSegment, WEBSITE_LOCALE_LIST } from '@/platform/i18n';
import {
  getIndexedWebsiteRoutes,
  getRobotsDisallowedRoutePaths,
  STATIC_WEBSITE_ROUTES,
  WEBSITE_ROUTE_FAMILY_LIST,
} from '@/platform/routing';
import { buildPageMetadata, getSiteUrl } from '@/platform/seo';
import { PreloadedPartnersContext } from '@/platform/ssg/PreloadedPartnersContext';

import { App } from './App';

// Re-exported for scripts/prerender.mjs: the SSR build (vite build --ssr
// src/entry-server.tsx) is the one place all of this already resolves
// aliases + workspace packages correctly, so the prerender script imports
// its output rather than re-deriving module resolution on its own.
export {
  buildPageMetadata,
  fetchLiveMarketplacePartners,
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
export const render = (
  url: string,
  preloadedPartners: readonly MarketplacePartner[] | null = null,
): string =>
  renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <PreloadedPartnersContext.Provider value={preloadedPartners}>
          <App />
        </PreloadedPartnersContext.Provider>
      </StaticRouter>
    </StrictMode>,
  );
