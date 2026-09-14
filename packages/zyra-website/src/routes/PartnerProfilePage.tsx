import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getMarketplacePartnerBySlug } from '@/partners-marketplace/get-marketplace-partner-by-slug';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PartnerProfile } from '@/partners-marketplace/PartnerProfile';
import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { usePreloadedPartners } from '@/platform/ssg/PreloadedPartnersContext';
import { Menu } from '@/sections/menu';

import NotFoundPage from './NotFoundPage';

const PartnerProfilePage = () => {
  const { i18n } = useLingui();
  const locale = useLocale();
  const { slug = '' } = useParams<{ slug: string }>();
  const preloaded = usePreloadedPartners();
  const preloadedPartner =
    preloaded?.find((candidate) => candidate.slug === slug) ?? null;

  const [partner, setPartner] = useState<MarketplacePartner | null | undefined>(
    preloaded !== null ? preloadedPartner : undefined,
  );

  useEffect(() => {
    if (preloaded !== null) return;
    let cancelled = false;
    getMarketplacePartnerBySlug(slug).then((result) => {
      if (!cancelled) setPartner(result);
    });
    return () => {
      cancelled = true;
    };
  }, [preloaded, slug]);

  useEffect(() => {
    if (partner) document.title = i18n._(msg`${partner.name} — Zyra Partner`);
  }, [i18n, partner]);

  if (partner === undefined) return null;
  if (partner === null) return <NotFoundPage />;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Marketplace', path: '/partners/list' },
            { name: partner.name, path: `/partners/profile/${partner.slug}` },
          ],
          locale,
        )}
      />
      <Menu scheme="muted" />
      <main aria-labelledby="partner-name">
        <PartnerProfile partner={partner} />
      </main>
    </>
  );
};

export default PartnerProfilePage;
