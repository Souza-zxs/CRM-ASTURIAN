import { Outlet } from 'react-router-dom';

import { Footer } from '@/sections/footer';

// The site-chrome layout: marketing pages get the shared footer here; the
// partner-application page (mounted directly under RootLayout, outside this
// layout) has no chrome. The Menu stays per-page since its scheme varies.
const SiteLayout = () => (
  <>
    <Outlet />
    <Footer />
  </>
);

export default SiteLayout;
