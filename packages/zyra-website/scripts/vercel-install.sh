#!/bin/sh
set -e

cd ../..

# The root package.json's postinstall runs patch-package against
# zyra-server's dependency tree (graphql, typeorm, etc.). Vercel's Nx-aware
# install for this workspace member doesn't pull those in, so patch-package
# fails on missing targets — neutralize it, it's irrelevant to this app.
npm pkg set scripts.postinstall=true

npm install --legacy-peer-deps --include=dev

# package-lock.json was generated on Windows; npm's optional-dependency
# resolution for platform-specific native bindings doesn't reliably pull in
# the linux-x64-gnu variant for several Rust/native-backed build tools at
# once (rolldown, @swc/core, @typescript/native-preview — npm/cli#4828).
# Same fix as packages/zyra-server's scripts/vercel-build.sh.
npm install --no-save --legacy-peer-deps --include=dev \
  @rolldown/binding-linux-x64-gnu \
  @swc/core-linux-x64-gnu \
  @typescript/native-preview-linux-x64
