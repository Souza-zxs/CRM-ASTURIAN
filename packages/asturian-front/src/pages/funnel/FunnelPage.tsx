import { ConfirmationPageView } from '@/funnel/components/ConfirmationPageView';
import { FunnelTrackingConsent } from '@/funnel/components/FunnelTrackingConsent';
import { SalesPageView } from '@/funnel/components/SalesPageView';
import { SignupPageView } from '@/funnel/components/SignupPageView';
import { WorkshopPageView } from '@/funnel/components/WorkshopPageView';
import { fetchFunnelPage, type FunnelPageResponse } from '@/funnel/api/fetch-funnel-page';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { NotFound } from '~/pages/not-found/NotFound';

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

// Fully public route (see BlankLayout in useCreateAppRouter.tsx) — funnel
// visitors are anonymous, unlike the rest of the CRM app. Content is
// fetched from the workspace's funnel-page backend at runtime, not part
// of the app's authenticated GraphQL data layer.
export const FunnelPage = () => {
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
  if (funnelPage === null) return <NotFound />;

  const renderPageView = () => {
    switch (funnelPage.content.type) {
      case 'SIGNUP':
        return (
          <SignupPageView
            content={funnelPage.content}
            funnelPageId={funnelPage.id}
          />
        );
      case 'WORKSHOP':
        return <WorkshopPageView content={funnelPage.content} />;
      case 'SALES':
        return <SalesPageView content={funnelPage.content} />;
      case 'CONFIRMATION':
        return <ConfirmationPageView content={funnelPage.content} />;
    }
  };

  return (
    <>
      {renderPageView()}
      <FunnelTrackingConsent pageKey={slug} />
    </>
  );
};
