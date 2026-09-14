import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { getPgSslOptions } from 'src/database/typeorm/utils/get-pg-ssl-options.util';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const typeORMRawModuleOptions: DataSourceOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: ['error'],
  ssl: getPgSslOptions(),
};

export const rawDataSource = new DataSource(typeORMRawModuleOptions);
