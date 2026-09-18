import { Suspense, useEffect, useState } from 'react';

import { fetchLiveMarketplacePartners } from '@/partners-marketplace/fetch-live-marketplace-partners';
import { MarketplaceClient } from '@/partners-marketplace/MarketplaceClient';
import { MarketplaceHeader } from '@/partners-marketplace/MarketplaceHeader';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { usePreloadedPartners } from '@/platform/ssg/PreloadedPartnersContext';
import { Menu } from '@/sections/menu';

export const PartnersListPage = () => {
  const locale = useLocale();
  const preloaded = usePreloadedPartners();
  const [partners, setPartners] = useState<readonly MarketplacePartner[]>(
    preloaded ?? [],
  );

  useEffect(() => {
    if (preloaded !== null) return;
    fetchLiveMarketplacePartners().then(setPartners);
    // Only re-fetch on mount: this is a one-shot load, not a subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Marketplace', path: '/partners/list' },
          ],
          locale,
        )}
      />
      <Menu scheme="light" />
      <main>
        <MarketplaceHeader />
        <Suspense fallback={null}>
          <MarketplaceClient partners={partners} />
        </Suspense>
      </main>
    </>
  );
};
