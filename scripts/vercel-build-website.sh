#!/bin/sh
set -e

# Same NODE_ENV=production caveat as the backend/frontend build scripts:
# plain `npm install` skips devDependencies, but Nx and the toolchain
# zyra-website needs (Next.js, SWC, wyw-in-js/linaria) live there.
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

cd packages/zyra-website && npx next build
