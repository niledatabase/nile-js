/* eslint-disable @typescript-eslint/no-explicit-any */
import 'knex';

import { ConnectionOptions } from 'tls';
import stream from 'node:stream';

import { Knex } from 'knex';

export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};

export type ServerConfig = {
  databaseId: string;
  tenantId?: string | null | undefined;
  userId?: string | null | undefined;
  db?: Knex.Config;
  api?: {
    basePath?: string;
    cookieKey?: string;
    token?: string;
  };
};

export type InstanceConfig = {
  databaseId?: string;
  tenantId?: string | null | undefined;
  userId?: string | null | undefined;
  db?: Knex.Config;
  api?: {
    basePath?: string;
    cookieKey?: string;
    token?: string;
  };
};
export type NileDb = Knex & { tenantId?: string };

// Config object for pg: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts
export type PgConnectionConfig = {
  user?: string;
  database?: string;
  password?: string | (() => string | Promise<string>);
  port?: number;
  host?: string;
  connectionString?: string;
  keepAlive?: boolean;
  stream?: stream.Duplex;
  statement_timeout?: false | number;
  parseInputDatesAsUTC?: boolean;
  ssl?: boolean | ConnectionOptions;
  query_timeout?: number;
  keepAliveInitialDelayMillis?: number;
  idle_in_transaction_session_timeout?: number;
  application_name?: string;
  connectionTimeoutMillis?: number;
  options?: string;
  expirationChecker?(): boolean;
};

export type AfterCreate = (
  conn: {
    on: any;
    query: (query: string, cb: (err: unknown) => void) => void;
  },
  done: (err: unknown, conn: unknown) => void
) => void;

export type PoolConfig = {
  name?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  afterCreate?: Function;
  min?: number;
  max?: number;
  refreshIdle?: boolean;
  idleTimeoutMillis?: number;
  reapIntervalMillis?: number;
  returnToHead?: boolean;
  priorityRange?: number;
  log?: (message: string, logLevel: string) => void;

  // tarn configs
  propagateCreateError?: boolean;
  createRetryIntervalMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
};
