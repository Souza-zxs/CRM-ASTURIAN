# Deploy on a shared VPS

This document describes how to publish the [Client Name] backend (server + worker) on a
dedicated VPS via Docker Compose, using external managed databases (Postgres and
Redis) instead of running these services on the VPS itself — the same model currently used
on Railway (`.railway/railway.ts`), just running in its own container.

The front-end (`packages/asturian-front`) is **not** served by this Compose — it is
published separately (e.g.: Vercel, via `scripts/vercel-build-front.sh`, which already
applies the whitelabel brand automatically). This guide covers only the backend.

## 1. Prerequisites on the VPS

- Docker + Docker Compose Plugin installed (`docker compose version`).
- A Postgres database reachable over the internet (e.g.: Supabase) and a connection URL.
- A Redis instance reachable over the internet (e.g.: Upstash) and its URL.
- The domain/port that will point to the `server` container (internal port 3000,
  published on `127.0.0.1:3002` — put a reverse proxy, e.g. Nginx/Caddy, in
  front for TLS and to expose it publicly).

## 2. Clone the repository and configure `.env.production`

```bash
git clone <repo> zyra && cd zyra
cp packages/zyra-server/.env.example packages/zyra-server/.env.production
```

Edit `packages/zyra-server/.env.production` with the production values. At
minimum:

```bash
NODE_ENV=production
PG_DATABASE_URL=postgres://usuario:senha@host:5432/banco
# If the managed Postgres requires SSL (e.g.: Supabase):
# PG_SSL_CA_PATH=./certs/supabase-ca.pem
REDIS_URL=redis://usuario:senha@host:6379
APP_SECRET=<long, unique random string>
FRONTEND_URL=https://app.seudominio.com
SERVER_URL=https://api.seudominio.com
SIGN_IN_PREFILLED=false
```

Do not set `EMAIL_FROM_NAME`, `ZYRA_PRODUCT_NAME`, `ZYRA_LOGO_URL`, etc. here —
these come from the whitelabel brand selected in step 3 (`.env.brand`, loaded
**before** `.env`/`.env.production` in `environment.module.ts`, so the brand
always takes priority for these specific fields).

## 3. Choose the whitelabel brand

Each brand lives at `brands/<slug>/brand.config.json` (see `brands/README.md`).
To create a new brand without hand-editing JSON:

```bash
npx nx build zyra-shared
node scripts/create-brand.mjs
```

To publish with a specific brand, export `ZYRA_BRAND` with the brand's slug
before the build — it is passed as a Dockerfile build arg and gets embedded in
the image (generates `packages/zyra-server/.env.brand` inside the container). Without
`ZYRA_BRAND`, the default is `zyra` (the fork's original identity, with no effect).
To publish with this client's brand, use `ZYRA_BRAND=cliente` (see
`brands/cliente/brand.config.json` and `brands/README.md`).

## 4. Start the containers

From the repository root:

```bash
ZYRA_BRAND=<slug-da-marca> docker compose -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

This builds and starts two services:

- `server` — API + GraphQL + migrations + cron jobs, exposes `127.0.0.1:3002`.
- `worker` — processes background queues (BullMQ), without its own migrations/cron
  (`DISABLE_DB_MIGRATIONS`/`DISABLE_CRON_JOBS_REGISTRATION`, so it doesn't compete
  with the `server`).

The `server`'s `healthcheck` allows up to 300s before checking health — the first boot
builds a large GraphQL schema and can take a while.

Follow the logs:

```bash
docker compose -f packages/zyra-docker/docker-compose.prod.yml logs -f
```

## 5. Switching brands later

Running the command from step 4 again with a different `ZYRA_BRAND` rebuilds the image
with the new identity — there's no need to recreate `.env.production` (only the
brand fields change, via `.env.brand`).

## 6. Multiple brands on the same VPS (optional)

This Compose brings up one instance at a time under the project name `zyra` (line
`name: zyra` in the file). To run more than one brand simultaneously on the
same VPS (each on different ports/domains), duplicate the
env file (`.env.production.<slug>`) and bring up each brand with a different project name and
host port, for example:

```bash
ZYRA_BRAND=acme-test docker compose -p zyra-acme-test \
  -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

(adjust the published `server` port in a copy of the compose file so it doesn't
collide with `127.0.0.1:3002` from another brand already running).

## References

- `brands/README.md` — how the brand system works.
- `scripts/select-brand.mjs` / `scripts/create-brand.mjs` — the mechanics behind it.
- `.railway/railway.ts` — the same backend, via Railway instead of a dedicated VPS.
- `packages/zyra-server/.env.example` — full list of supported variables.
