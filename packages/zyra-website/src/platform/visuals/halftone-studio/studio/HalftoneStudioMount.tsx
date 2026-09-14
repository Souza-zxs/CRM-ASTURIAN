'use client';

import { lazy } from 'react';

import { ClientOnly } from '@/platform/client-only';

// The ONLY import() of the studio: three + the WebGL canvas stay out of every
// initial chunk (check-visual-bundle), and the heavy tree is client-only
// since it builds its scene in effects against the live DOM.
const HalftoneStudio = lazy(() =>
  import('./HalftoneStudio').then((module) => ({
    default: module.HalftoneStudio,
  })),
);

export function HalftoneStudioMount() {
  return (
    <ClientOnly>
      <HalftoneStudio />
    </ClientOnly>
  );
}
