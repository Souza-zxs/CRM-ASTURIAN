import { css } from '@linaria/core';

import { color, fontFamily } from '@/tokens';

// Self-hosted fonts (public/fonts/, downloaded from Google Fonts' latin
// subset — see src/routes/RootLayout.tsx for the rationale) bound to the
// same --font-* custom properties src/tokens/font-family.ts already reads.
// Host Grotesk and Azeret Mono ship as variable fonts (Google serves one
// file across their whole requested weight range), so each gets a single
// @font-face with a weight range rather than one rule per static weight.
export const fontFaceStyles = css`
  @font-face {
    font-display: swap;
    font-family: 'Host Grotesk';
    font-style: normal;
    font-weight: 300 600;
    src: url('/fonts/host-grotesk-latin-variable.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Aleo';
    font-style: normal;
    font-weight: 300;
    src: url('/fonts/aleo-latin-300.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Azeret Mono';
    font-style: normal;
    font-weight: 300 500;
    src: url('/fonts/azeret-mono-latin-variable.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'VT323';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/vt323-latin-400.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/inter-latin-400.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    src: url('/fonts/inter-latin-500.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    src: url('/fonts/inter-latin-600.woff2') format('woff2');
  }

  :global(:root) {
    --font-sans: 'Host Grotesk';
    --font-serif: 'Aleo';
    --font-mono: 'Azeret Mono';
    --font-retro: 'VT323';
    --font-product: 'Inter';
  }
`;

// Base reset + reduced-motion handling, ported from the old app/[locale]/layout.tsx.
export const globalStyles = css`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background-color: ${color('white')};
    color: ${color('black')};
    font-family: ${fontFamily('sans')};
    min-height: 100vh;
    min-height: 100dvh;
    -webkit-font-smoothing: antialiased;
  }
`;
