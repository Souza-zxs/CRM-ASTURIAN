#!/bin/sh
set -e

# Applies ZYRA_BRAND (default "zyra") — most importantly writes
# packages/zyra-server/.env.brand, which ZyraConfigService reads at boot for
# product name, sender identity, logo and legal text. Zero npm deps, safe to
# run before install. See brands/README.md.
node scripts/select-brand.mjs

# NODE_ENV=production is set for this Vercel environment, which makes plain
# `npm install` skip devDependencies (nx and roughly half the workspace's
# tooling live there) — --include=dev overrides that for every install call
# in this script, not just the first.
npm install --legacy-peer-deps --include=dev

# package-lock.json was generated on Windows; npm's optional-dependency
# resolution for platform-specific native bindings doesn't reliably pull in
# the linux-x64-gnu variant for several Rust/native-backed build tools at
# once (rolldown, @swc/core, @typescript/native-preview — npm/cli#4828).
npm install --no-save --legacy-peer-deps --include=dev \
  @rolldown/binding-linux-x64-gnu \
  @swc/core-linux-x64-gnu \
  @typescript/native-preview-linux-x64

npx nx run zyra-server:build

# This deployment is API-only (see vercel.json's rewrites) — Vercel still
# wants a static Output Directory to exist.
mkdir -p public
echo 'Zyra API' > public/index.html
