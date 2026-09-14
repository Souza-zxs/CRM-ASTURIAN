import { readFileSync } from 'fs';

export type PgSslOptions = { ca: string; rejectUnauthorized: true } | { rejectUnauthorized: false };

// Four ways to run Postgres over TLS, in order of preference:
// 1. PG_SSL_CA_CONTENT — the PEM-encoded CA certificate itself (e.g.
//    Supabase's Root CA, which Node's default trust store doesn't
//    recognize), passed directly as an env var value. Portable across any
//    runtime — no filesystem path to resolve, which matters on serverless
//    platforms (Vercel) where the working directory at runtime doesn't
//    match the build-time layout.
// 2. PG_SSL_CA_PATH — same CA pinning, but read from a file path. Only
//    reliable when the deployment's working directory is predictable
//    (containers with a fixed WORKDIR, traditional VMs) — prefer
//    PG_SSL_CA_CONTENT for serverless.
// 3. PG_SSL_ALLOW_SELF_SIGNED — skip chain validation entirely. Only use
//    this for genuinely self-signed/local certs where pinning a CA isn't
//    possible; it accepts any certificate on this connection.
// 4. None set — rely on the connection string's own sslmode (or no TLS at
//    all for a plain local Postgres).
export const getPgSslOptions = (): PgSslOptions | undefined => {
  if (process.env.PG_SSL_CA_CONTENT) {
    return {
      ca: process.env.PG_SSL_CA_CONTENT,
      rejectUnauthorized: true,
    };
  }

  if (process.env.PG_SSL_CA_PATH) {
    return {
      ca: readFileSync(process.env.PG_SSL_CA_PATH, 'utf8'),
      rejectUnauthorized: true,
    };
  }

  if (process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true') {
    return { rejectUnauthorized: false };
  }

  return undefined;
};
