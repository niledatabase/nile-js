import { PoolClient, PoolConfig } from 'pg';

export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};

export type NilePoolConfig = PoolConfig & { afterCreate?: AfterCreate };
export type ServerConfig = {
  databaseId?: string;
  username?: string;
  password?: string;
  databaseName?: string;
  tenantId?: string | null | undefined;
  userId?: string | null | undefined;
  debug?: boolean;
  db?: NilePoolConfig;
  api?: {
    basePath?: string;
    cookieKey?: string;
    token?: string;
  };
};

export type InstanceConfig = {
  databaseId: string;
  username: string;
  password: string;
  tenantId?: string | null | undefined;
  userId?: string | null | undefined;
  debug?: boolean;
  db?: NilePoolConfig;
  api?: {
    basePath?: string;
    cookieKey?: string;
    token?: string;
  };
};

export type NileDb = NilePoolConfig & { tenantId?: string };

export type AfterCreate = (
  conn: PoolClient,
  done: (err: null | Error, conn: PoolClient) => void
) => void;
