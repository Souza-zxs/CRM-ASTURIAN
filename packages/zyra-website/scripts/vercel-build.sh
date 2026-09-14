#!/bin/sh
set -e

# zyra-website imports zyra-shared and zyra-ui directly (e.g. the animated
# product-preview mockups pull tokens from zyra-ui/theme) — both must be
# built first, same as the root vercel.website.json's pipeline. Without
# this, `next build` still succeeds (these resolve to whatever stale
# dist/ happens to be lying around, or fail silently at runtime), which is
# why animations/themed previews went missing after the Root Directory
# switch to this package's own vercel.json dropped this step.
cd ../..
npx nx build zyra-shared
npx nx build zyra-ui
cd packages/zyra-website

npm run build
