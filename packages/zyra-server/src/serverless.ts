import { type Express, type Request, type Response } from 'express';

import { createApp } from './bootstrap-app';

// Vercel's Node.js runtime hands requests to this file as plain Node
// req/res objects — an Express app is itself a valid (req, res) => void
// handler, so no AWS-Lambda-event-shaped adapter (serverless-http et al.)
// is needed here.
//
// The app is built once per cold start and cached across warm
// invocations of the same function instance — re-running createApp() on
// every request would redo the full ~5-10s module bootstrap (DB/Redis
// connections, GraphQL schema generation, etc.) on every single request.
let cachedServer: Express | null = null;
let appPromise: Promise<Express> | null = null;

const getServer = (): Promise<Express> => {
  appPromise ??= createApp().then(async (app) => {
    await app.init();

    const server = app.getHttpAdapter().getInstance() as Express;

    cachedServer = server;

    return server;
  });

  return appPromise;
};

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  const server = cachedServer ?? (await getServer());

  server(req, res, () => {});
}
