import { defineRailway, preserve, project, service } from "railway/iac";

// Both services build the same zyra-server app; only the start command
// differs. No `source` is set here on purpose — code is deployed with
// `railway up --service <name>` from the local build rather than a GitHub
// connection, so secrets never need to touch a committed config file.
const BUILD_COMMAND =
  "npm install --legacy-peer-deps && npx nx run zyra-server:build";

export default defineRailway(() => {
  const server = service("server", {
    build: BUILD_COMMAND,
    // The Dockerfile's WORKDIR is already /app/packages/zyra-server, so this
    // is relative to that — no `cd` prefix (that would try to descend into
    // a nonexistent nested packages/zyra-server and fail silently before
    // Node even starts).
    start: "node dist/main",
    healthcheck: "/healthz",
    // This app builds a large dynamic GraphQL schema at boot (metadata-driven,
    // hundreds of modules) — the default 5-minute healthcheck retry window
    // isn't confirmed to be enough, and with LOG_LEVELS trimmed down to avoid
    // Railway's per-second log-rate limit we can't see progress during that
    // phase. Give it more room before giving up.
    healthcheckTimeout: 900,
    env: {
      NODE_ENV: "production",
      // ${{PORT}} only gets populated once the service has public
      // networking/a domain configured — without that, it resolves to an
      // empty value, NODE_PORT's cast-to-number falls back to 0, and
      // Node's app.listen(0, ...) binds to a random ephemeral port every
      // restart. Fix that at the source (enable networking on 3000 below)
      // and use a fixed, known port here to match.
      NODE_PORT: "3000",
      // NestJS's default 'log' level dumps hundreds of module-init lines at
      // once on this app's boot, tripping Railway's 500 logs/sec-per-replica
      // rate limit and getting silently dropped — keep it to error/warn.
      LOG_LEVELS: "error,warn",
      // Set out-of-band via `railway variable set --stdin` so secret values
      // never touch this committed file — preserve() tells IaC apply to
      // leave whatever is already there alone instead of deleting it.
      PG_DATABASE_URL: preserve(),
      PG_SSL_CA_PATH: preserve(),
      REDIS_URL: preserve(),
      APP_SECRET: preserve(),
    },
  });

  const worker = service("worker", {
    build: BUILD_COMMAND,
    start: "node dist/queue-worker/queue-worker",
    env: {
      NODE_ENV: "production",
      DISABLE_DB_MIGRATIONS: "true",
      DISABLE_CRON_JOBS_REGISTRATION: "true",
      LOG_LEVELS: "error,warn",
      PG_DATABASE_URL: preserve(),
      PG_SSL_CA_PATH: preserve(),
      REDIS_URL: preserve(),
      APP_SECRET: preserve(),
    },
  });

  return project("Zyra", {
    resources: [server, worker],
  });
});
