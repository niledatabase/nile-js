import { PoolClient, PoolConfig } from 'pg';

export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};

export type NilePoolConfig = PoolConfig & { afterCreate?: AfterCreate };
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
  api?: {
    version?: number;
    basePath?: string; // process.env.NILEDB_API
    cookieKey?: string;
    token?: string; // process.env.NILEDB_TOKEN
  };
};

export type NileDb = NilePoolConfig & { tenantId?: string };

export type AfterCreate = (
  conn: PoolClient,
  done: (err: null | Error, conn: PoolClient) => void
) => void;

export type Database = {
  name: string;
  apiHost: string;
  dbHost: string;
  id: string;
  message?: string; // is actually an error
  status: 'READY' | string;
};
