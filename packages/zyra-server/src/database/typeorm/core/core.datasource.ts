import { join } from 'path';

import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { DataSource, type DataSourceOptions, type LogLevel } from 'typeorm';

import { getPgSslOptions } from 'src/database/typeorm/utils/get-pg-ssl-options.util';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const isRunningCommand = (): boolean => {
  const scriptPath = process.argv[1] || '';

  return scriptPath.includes('/command/command.');
};

const getLoggingConfig = (): LogLevel[] => {
  if (process.env.NODE_ENV === 'test') {
    return [];
  }
  const ormQueryLogging = process.env.ORM_QUERY_LOGGING || 'disabled';

  switch (ormQueryLogging) {
    case 'disabled':
      return ['error'];
    case 'server-only':
      if (isRunningCommand()) {
        return ['error'];
      }

      return ['query', 'error'];
    case 'always':
      return ['query', 'error'];
    default:
      return ['error'];
  }
};

const isJest = process.argv.some((arg) => arg.includes('jest'));

// TypeORM resolves these globs relative to whatever the process's cwd
// happens to be at runtime — fine locally and on Railway, where the process
// is started from this package's own root, but on Vercel the function's
// cwd is the bundle root (e.g. /var/task), several directories above where
// this package's compiled dist/ actually lives (/var/task/packages/
// zyra-server/dist/...). A relative glob silently matches nothing there —
// no error, just an empty entity list, which then surfaces much later as
// "No metadata for <Entity> was found" the first time a repository is
// used. Anchoring to __dirname (this file's own location, wherever the
// bundler puts it) makes the glob resolve the same way regardless of cwd.
// Jest is left on its existing cwd-relative "src/..." paths since it's
// invoked from this package's root today and already works.
const packageRoot = join(__dirname, '../../../..');
const entityGlob = (pattern: string): string =>
  isJest ? `src/${pattern}` : join(packageRoot, 'dist', pattern);

export const typeORMCoreModuleOptions: TypeOrmModuleOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: getLoggingConfig(),
  schema: 'core',
  entities:
    process.env.IS_BILLING_ENABLED === 'true'
      ? [
          entityGlob('engine/core-modules/**/*.entity{.ts,.js}'),
          entityGlob('engine/metadata-modules/**/*.entity{.ts,.js}'),
        ]
      : [
          entityGlob('engine/core-modules/**/!(billing-*).entity.{ts,js}'),
          entityGlob('engine/metadata-modules/**/*.entity{.ts,.js}'),
        ],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  metadataTableName: '_typeorm_generated_columns_and_materialized_views',
  // The TypeORM migration system is frozen — historical migrations live in
  // `legacy-typeorm-migrations-do-not-add/` and are loaded here only so the
  // `_typeorm_migrations` table stays consistent for older deployments.
  // Do NOT add new files there: write a fast/slow instance command instead.
  // See `packages/zyra-server/docs/UPGRADE_COMMANDS.md`.
  migrations:
    process.env.IS_BILLING_ENABLED === 'true'
      ? [
          entityGlob(
            'database/typeorm/core/legacy-typeorm-migrations-do-not-add/common/*{.ts,.js}',
          ),
          entityGlob(
            'database/typeorm/core/legacy-typeorm-migrations-do-not-add/billing/*{.ts,.js}',
          ),
        ]
      : [
          entityGlob(
            'database/typeorm/core/legacy-typeorm-migrations-do-not-add/common/*{.ts,.js}',
          ),
        ],
  ssl: getPgSslOptions(),
  extra: {
    query_timeout: Number(process.env.PG_DATABASE_PRIMARY_TIMEOUT_MS ?? 10000),
    idleTimeoutMillis: Number(process.env.PG_POOL_IDLE_TIMEOUT_MS ?? 600000),
    allowExitOnIdle: process.env.PG_POOL_ALLOW_EXIT_ON_IDLE === 'true',
  },
};

export const connectionSource = new DataSource(
  typeORMCoreModuleOptions as DataSourceOptions,
);
