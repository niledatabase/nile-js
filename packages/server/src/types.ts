import { PoolClient, PoolConfig } from 'pg';

import { ApiParams } from './utils/Config';

export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};

export type NilePoolConfig = PoolConfig & { afterCreate?: AfterCreate };
export type LoggerType = {
  info?: (args: unknown | unknown[]) => void;
  warn?: (args: unknown | unknown[]) => void;
  error?: (args: unknown | unknown[]) => void;
  debug?: (args: unknown | unknown[]) => void;
};
export type ServerConfig = {
  databaseId?: string; // process.env.NILEDB_ID
  user?: string; // process.env.NILEDB_USER
  password?: string; // process.env.NILEDB_PASSWORD
  databaseName?: string; // process.env.NILEDB_NAME
  tenantId?: string | null | undefined; // process.env.NILEDB_TENANT
  userId?: string | null | undefined;
  debug?: boolean;
  configureUrl?: string; // process.env.NILEDB_CONFIGURE
  db?: NilePoolConfig; // db.host process.env.NILEDB_HOST
  api?: ApiParams;
  logger?: LoggerType;
};

export type NileDb = NilePoolConfig & { tenantId?: string };

export type AfterCreate = (
  conn: PoolClient,
  done: (err: null | Error, conn: PoolClient) => void
) => void;
