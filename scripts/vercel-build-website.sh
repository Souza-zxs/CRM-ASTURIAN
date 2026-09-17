#!/bin/sh
set -e

# Note: unlike the other build scripts, select-brand.mjs does NOT touch
# zyra-website (see brands/README.md) — its ZYRA_BRAND identity is separate
# from the CRM app's, so no brand-selection step runs here.

# Same NODE_ENV=production caveat as the backend/frontend build scripts:
# plain `npm install` skips devDependencies, but Nx and the toolchain
# zyra-website needs (Vite, SWC, wyw-in-js/linaria) live there.
npm install --legacy-peer-deps --include=dev

# Same native-binding gap as the other build scripts (npm/cli#4828).
npm install --no-save --legacy-peer-deps --include=dev \
  @rolldown/binding-linux-x64-gnu \
  @swc/core-linux-x64-gnu \
  @typescript/native-preview-linux-x64

# zyra-website imports zyra-shared and zyra-ui directly — both must be
# built first, same as the backend/frontend builds.
npx nx build zyra-shared
npx nx build zyra-ui

# zyra-website is a Vite SPA with SSR-based prerendering (not Next.js) —
# npm run build does: client build -> SSR build (dist-ssr) -> prerender.mjs
# (renders every static route to HTML into dist/, writes robots.txt/
# sitemap.xml, then removes dist-ssr). Final static output lands in
# packages/zyra-website/dist.
npx nx build zyra-website
