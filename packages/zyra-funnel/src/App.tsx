import { fetchFunnelPage } from '@/api/fetchFunnelPage';
import { ConfirmationPageView } from '@/pages/ConfirmationPageView';
import { SalesPageView } from '@/pages/SalesPageView';
import { SignupPageView } from '@/pages/SignupPageView';
import { WorkshopPageView } from '@/pages/WorkshopPageView';
import { type FunnelPageResponse } from '@/types/FunnelPageContent';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';

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

const FunnelPageRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'not-found' }
    | { status: 'error' }
    | { status: 'ready'; funnelPage: FunnelPageResponse }
  >({ status: 'loading' });

  useEffect(() => {
    if (slug === undefined) {
      return;
    }

    let isCancelled = false;
    setState({ status: 'loading' });

    fetchFunnelPage(slug)
      .then((funnelPage) => {
        if (isCancelled) {
          return;
        }

        if (funnelPage === null) {
          setState({ status: 'not-found' });
          return;
        }

        applySeo(funnelPage);
        setState({ status: 'ready', funnelPage });
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  if (state.status === 'loading') {
    return <p className="status-page">Carregando...</p>;
  }

  if (state.status === 'not-found') {
    return <p className="status-page">Página não encontrada.</p>;
  }

  if (state.status === 'error') {
    return (
      <p className="status-page">
        Não foi possível carregar esta página. Tente novamente em instantes.
      </p>
    );
  }

  const { funnelPage } = state;

  switch (funnelPage.content.type) {
    case 'SIGNUP':
      return (
        <SignupPageView
          funnelPageId={funnelPage.id}
          content={funnelPage.content}
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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<FunnelPageRoute />} />
        <Route
          path="/"
          element={<p className="status-page">Página não encontrada.</p>}
        />
      </Routes>
    </BrowserRouter>
  );
};
