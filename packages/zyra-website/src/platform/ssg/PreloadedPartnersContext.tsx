import { createContext, useContext } from 'react';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';

// The marketplace list/profile pages fetch live partner data. During the SSG
// prerender pass (scripts/prerender.mjs), that data is fetched once per page
// and threaded in here so the prerendered HTML isn't a loading skeleton; on
// the client (fresh load or navigation) this is null and the pages fetch it
// themselves.
export const PreloadedPartnersContext = createContext<
  readonly MarketplacePartner[] | null
>(null);

export const usePreloadedPartners = (): readonly MarketplacePartner[] | null =>
  useContext(PreloadedPartnersContext);
