// Must run before any other import in this file — AppModule's provider
// graph (imported below) transitively requires jsdom, which can throw
// ERR_REQUIRE_ESM on some deploy targets. oxlint/import-sort: keep this
// first, out of the usual external-then-internal order.
import { preloadEsmOnlyModuleForRequire } from './utils/patch-node-require-for-esm-only-modules.util';

import { type LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';
import { inspect } from 'util';

import bytes from 'bytes';
import { useContainer } from 'class-validator';
import session from 'express-session';

import { NodeEnvironment } from 'src/engine/core-modules/zyra-config/interfaces/node-environment.interface';

import { setPgDateTypeParser } from 'src/database/pg/set-pg-date-type-parser';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { configTransformers } from 'src/engine/core-modules/zyra-config/utils/config-transformers.util';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

// AppModule is required lazily below, after the parse5 preload resolves —
// NOT imported statically here. AppModule's provider graph includes
// MessageCampaignService, which synchronously `new JSDOM(...)`s (see the
// parse5 comment in patch-node-require-for-esm-only-modules.util.ts), and
// on Vercel that instantiation was observed happening before the awaited
// preload below had resolved when this was a static top-of-file import —
// likely because `import './instrument'` (Sentry) or some other transitive
// side effect in AppModule's graph reaches jsdom eagerly at module-evaluation
// time, ahead of anything inside createApp()'s function body. Requiring it
// lazily guarantees the preload has *fully* resolved — not just been
// kicked off — before AppModule's module graph is even loaded, let alone
// instantiated.
import type { AppModule as AppModuleType } from './app.module';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';

// Shared between the traditional long-running server (main.ts, used on
// Railway/self-hosted) and the Vercel serverless entrypoint (serverless.ts).
// Builds and fully configures the Nest/Express app but does NOT call
// app.listen() — the caller decides how the app is actually served
// (bind a port, or hand the underlying Express instance to a serverless
// request handler).
export const createApp = async (): Promise<NestExpressApplication> => {
  setPgDateTypeParser();

  // Must resolve before NestFactory.create() below: it synchronously
  // instantiates providers (e.g. MessageCampaignService) that transitively
  // `new JSDOM(...)`, which calls into parse5 synchronously the moment
  // it's instantiated. See patch-node-require-for-esm-only-modules.util.ts.
  await preloadEsmOnlyModuleForRequire('parse5');

  // Loaded here (not statically at the top of the file) so nothing in
  // AppModule's module graph — Sentry's ./instrument included — can reach
  // jsdom/parse5 before the preload above has actually resolved. Plain
  // require(), not dynamic import(): these are this app's own CJS-compiled
  // files, not ESM-only packages, so there's no SWC-rewrite hazard here.
  /* eslint-disable @typescript-eslint/no-require-imports */
  require('./instrument');
  const { AppModule } = require('./app.module') as {
    AppModule: typeof AppModuleType;
  };
  /* eslint-enable @typescript-eslint/no-require-imports */

  const resolvedLoggerLevels = (process.env.LOG_LEVELS?.split(',').map(
    (level) => level.trim(),
  ) as LogLevel[] | undefined) ?? ['log', 'error', 'warn'];

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Expose WWW-Authenticate so browser-based MCP clients can read the
    // resource_metadata pointer on 401. Required by MCP authorization spec.
    cors: { exposedHeaders: ['WWW-Authenticate'] },
    logger: resolvedLoggerLevels,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
    ...(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });

  const logger = app.get(LoggerService);
  const zyraConfigService = app.get(ZyraConfigService);
  const exceptionHandlerService = app.get(ExceptionHandlerService);

  process.on('unhandledRejection', (reason) => {
    const error =
      reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : inspect(reason));

    if (shouldCaptureException(error)) {
      exceptionHandlerService.captureExceptions([error]);
    }
  });

  const trustProxyRaw = zyraConfigService.get('TRUST_PROXY');
  const trustProxy = /^\d+$/.test(trustProxyRaw)
    ? Number(trustProxyRaw)
    : (configTransformers.boolean(trustProxyRaw) ?? trustProxyRaw);

  app.set('trust proxy', trustProxy);

  app.use(session(getSessionStorageOptions(zyraConfigService)));

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new UnhandledExceptionFilter());

  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });
  app.useBodyParser('text', { type: 'text/plain', limit: '1024kb' });

  // graphql-upload ships as an ESM-only .mjs file with no CJS entry point.
  // A static import — or even `await import(...)` — gets compiled by SWC's
  // CommonJS output to `Promise.resolve().then(() => require(...))`, which
  // is still a synchronous require() of an ESM module under the hood and
  // fails the same way (ERR_REQUIRE_ESM), notably under Vercel's serverless
  // runtime. Building the import() call from a string via `new Function`
  // hides it from SWC's static analysis, so it survives as a real dynamic
  // import — Node's documented way for a CJS module to load an ESM one.
  const dynamicImport = new Function(
    'specifier',
    'return import(specifier)',
  ) as (specifier: string) => Promise<{
    default: typeof import('graphql-upload/graphqlUploadExpress.mjs').default;
  }>;
  const { default: graphqlUploadExpress } = await dynamicImport(
    'graphql-upload/graphqlUploadExpress.mjs',
  );

  // Graphql file upload
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  app.use(
    '/metadata',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  // Inject the server url in the frontend page
  generateFrontConfig();

  return app;
};
