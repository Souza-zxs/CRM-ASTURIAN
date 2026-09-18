import { type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

import { CustomersPage } from './routes/CustomersPage';
import { HalftonePage } from './routes/HalftonePage';
import { HomePage } from './routes/HomePage';
import { NotFoundPage } from './routes/NotFoundPage';
import { PartnerApplyPage } from './routes/PartnerApplyPage';
import { PartnerProfilePage } from './routes/PartnerProfilePage';
import { PartnersListPage } from './routes/PartnersListPage';
import { PartnersPage } from './routes/PartnersPage';
import { PricingPage } from './routes/PricingPage';
import { PrivacyPolicyPage } from './routes/PrivacyPolicyPage';
import { ProductPage } from './routes/ProductPage';
import { ReleasesPage } from './routes/ReleasesPage';
import { RootLayout } from './routes/RootLayout';
import { SiteLayout } from './routes/SiteLayout';
import { TermsPage } from './routes/TermsPage';
import { WhyZyraPage } from './routes/WhyZyraPage';

// The marketing routes, mirroring the old app/[locale]/** tree. The source
// locale (en) is unprefixed; other locales get a short URL segment — see
// src/platform/i18n/locale-to-url-segment.ts. Since there's no server-side
// rewrite step anymore (SSG output files land at the right path directly,
// see scripts/prerender.mjs), the client router mounts this same route tree
// twice: once at "/" and once at "/:localeSegment", both wrapped by the
// same RootLayout, which resolves whichever locale is in play.
const renderSiteRoutes = (): ReactNode => (
  <>
    <Route element={<SiteLayout />}>
      <Route element={<HomePage />} index />
      <Route element={<CustomersPage />} path="customers" />
      <Route element={<PartnersPage />} path="partners" />
      <Route element={<PartnersListPage />} path="partners/list" />
      <Route element={<PartnerProfilePage />} path="partners/profile/:slug" />
      <Route element={<PricingPage />} path="pricing" />
      <Route element={<PrivacyPolicyPage />} path="privacy-policy" />
      <Route element={<ProductPage />} path="product" />
      <Route element={<ReleasesPage />} path="releases" />
      <Route element={<TermsPage />} path="terms" />
      <Route element={<WhyZyraPage />} path="why-zyra" />
    </Route>
    <Route element={<PartnerApplyPage />} path="partners/apply" />
    <Route element={<HalftonePage />} path="halftone" />
  </>
);

export const App = () => (
  <Routes>
    <Route element={<RootLayout />}>{renderSiteRoutes()}</Route>
    <Route element={<RootLayout />} path=":localeSegment">
      {renderSiteRoutes()}
    </Route>
    <Route element={<NotFoundPage />} path="*" />
  </Routes>
);
