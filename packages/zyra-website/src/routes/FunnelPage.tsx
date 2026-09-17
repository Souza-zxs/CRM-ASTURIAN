import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FunnelPageType } from 'zyra-shared/types';

import {
  fetchFunnelPage,
  type FunnelPageResponse,
} from '@/funnel/api/fetchFunnelPage';
import { ConfirmationPageView } from '@/funnel/ConfirmationPageView';
import { SalesPageView } from '@/funnel/SalesPageView';
import { SignupPageView } from '@/funnel/SignupPageView';
import { WorkshopPageView } from '@/funnel/WorkshopPageView';

import NotFoundPage from './NotFoundPage';

const applySeo = (funnelPage: FunnelPageResponse) => {
  if (funnelPage.seoTitle !== null) {
    document.title = funnelPage.seoTitle;
  }

  if (funnelPage.seoDescription !== null) {
    let meta = document.querySelector('meta[name="description"]');

    if (meta === null) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', funnelPage.seoDescription);
  }
};

// Dynamic funnel pages (signup/workshop/sales/confirmation) live at /w/:slug
// and are fetched at runtime from the workspace's funnel content — unlike
// the rest of the site's static marketing routes, content here changes
// without a redeploy (see packages/zyra-server's funnel-page module).
const FunnelPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [funnelPage, setFunnelPage] = useState<
    FunnelPageResponse | null | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    setFunnelPage(undefined);

    fetchFunnelPage(slug)
      .then((result) => {
        if (cancelled) return;
        setFunnelPage(result);
        if (result !== null) applySeo(result);
      })
      .catch(() => {
        if (!cancelled) setFunnelPage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (funnelPage === undefined) return null;
  if (funnelPage === null) return <NotFoundPage />;

  switch (funnelPage.content.type) {
    case FunnelPageType.SIGNUP:
      return (
        <SignupPageView
          content={funnelPage.content}
          funnelPageId={funnelPage.id}
        />
      );
    case FunnelPageType.WORKSHOP:
      return <WorkshopPageView content={funnelPage.content} />;
    case FunnelPageType.SALES:
      return <SalesPageView content={funnelPage.content} />;
    case FunnelPageType.CONFIRMATION:
      return <ConfirmationPageView content={funnelPage.content} />;
  }
};

export default FunnelPage;
