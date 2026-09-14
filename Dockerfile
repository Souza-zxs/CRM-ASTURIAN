# Single-stage build: this repo has no prior production Dockerfile (the
# docker-compose.yml under packages/zyra-docker references an image,
# zyracrm/zyra, that was never actually published), so this is a first-cut
# build focused on correctness over image size. Splitting into a slim
# multi-stage runtime image is a reasonable follow-up once this is proven to
# work end-to-end on Railway.
FROM node:24-bookworm-slim

WORKDIR /app

# Some workspace package's postinstall script shells out to `yarn` directly;
# the root package.json pins packageManager to yarn@11.13.0 via Corepack, so
# Corepack must be enabled or that postinstall fails against the image's
# default Yarn 1.x.
RUN corepack enable

COPY . .

# White-label brand baked into this image. Defaults to "zyra" (a no-op) —
# pass --build-arg ZYRA_BRAND=<slug> (or the ZYRA_BRAND compose build arg,
# see docker-compose.prod.yml) to bake a different brand's identity
# (email sender name/logo/legal text) into this server build. See
# brands/README.md and docs/deploy-vps.md.
ARG ZYRA_BRAND=zyra
ENV ZYRA_BRAND=$ZYRA_BRAND

# package-lock.json was generated on Windows; npm's optional-dependency
# resolution for platform-specific native bindings doesn't reliably pull in
# the linux-x64-gnu variant for several Rust/native-backed tools at once
# (rolldown, @swc/core, @typescript/native-preview — npm/cli#4828). Dropping
# the whole lockfile "fixes" that but causes worse version drift elsewhere
# (newer TypeScript/icon-package versions that aren't actually compatible
# with this codebase), and `npm install --force` alone still doesn't pull
# these in either — so keep the lockfile and explicitly force-install each
# missing linux-x64-gnu native binding on top of the normal install.
RUN npm install --legacy-peer-deps \
    && npm install --no-save --legacy-peer-deps \
         @rolldown/binding-linux-x64-gnu \
         @swc/core-linux-x64-gnu \
         @typescript/native-preview-linux-x64 \
    && node scripts/select-brand.mjs \
    && npx nx run zyra-server:build

WORKDIR /app/packages/zyra-server

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
