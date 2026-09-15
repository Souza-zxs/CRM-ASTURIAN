#!/bin/sh
set -e

# zyra-funnel is a standalone package with no dependency on zyra-shared or
# any other package in the monorepo (deliberately, so it can be deployed as
# its own small static site, separate from the main product's app/website).
npm install --legacy-peer-deps --include=dev

npx nx build zyra-funnel
