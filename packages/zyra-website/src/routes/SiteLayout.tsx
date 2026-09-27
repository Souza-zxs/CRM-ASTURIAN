import { Outlet } from 'react-router-dom';

import { Footer } from '@/sections/footer';

// The site-chrome layout: marketing pages get the shared footer here. The
// Menu stays per-page since its scheme varies.
export const SiteLayout = () => (
  <>
    <Outlet />
    <Footer />
  </>
);
