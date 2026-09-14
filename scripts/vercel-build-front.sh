#!/bin/sh
set -e

# Applies ZYRA_BRAND (default "zyra") to index.html/manifest.json/the accent
# theme before anything else builds — zero npm deps, safe to run before
# install. See brands/README.md.
node scripts/select-brand.mjs

# Same NODE_ENV=production caveat as vercel-build.sh (the backend build
# script): plain `npm install` skips devDependencies, but Nx and the Vite/
# SWC toolchain zyra-front needs to build live there.
npm install --legacy-peer-deps --include=dev

# Same native-binding gap as the backend build (npm/cli#4828) — Vite's
# build here goes through @vitejs/plugin-react-swc and @wyw-in-js, both
# backed by the Rust/SWC toolchain.
npm install --no-save --legacy-peer-deps --include=dev \
  @rolldown/binding-linux-x64-gnu \
  @swc/core-linux-x64-gnu \
  @typescript/native-preview-linux-x64

# zyra-front imports zyra-shared directly (e.g. zyra-shared/vite) — it must
# be built first, same as the backend build.
npx nx build zyra-shared
npx nx build zyra-front

# This is a standalone static deploy (its own Vercel project/domain, no
# backend alongside it), so generateFrontConfig.ts's request-time injection
# of window._env_ (used when the backend serves the frontend itself, e.g.
# Railway) never runs here. Bake the backend origin in at build time instead
# — src/config/index.ts falls back to same-origin otherwise, which would
# point API calls at this static site's own domain instead of the backend.
if [ -n "$REACT_APP_SERVER_BASE_URL" ]; then
  node -e "
    const fs = require('fs');
    const path = 'packages/zyra-front/build/index.html';
    const url = process.env.REACT_APP_SERVER_BASE_URL;
    let html = fs.readFileSync(path, 'utf8');
    html = html.replace(
      /<!-- BEGIN: Zyra Config -->[\s\S]*?<!-- END: Zyra Config -->/,
      '<!-- BEGIN: Zyra Config -->\n    <script id=\"zyra-env-config\">\n      window._env_ = ' +
        JSON.stringify({ REACT_APP_SERVER_BASE_URL: url }) +
        ';\n    </script>\n    <!-- END: Zyra Config -->',
    );
    fs.writeFileSync(path, html);
  "
fi
