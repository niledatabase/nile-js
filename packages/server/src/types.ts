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
  database: string;
  tenantId?: string;
  workspace: string;
  db?: Knex.Config;
  api?: {
    basePath?: string;
    cookieKey?: string;
    token?: string;
  };
};

export type KnexConfig = Knex.Config;

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
