import { PoolClient, PoolConfig } from 'pg';

import { Routes } from './api/types';

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
  /**
   * The specific database id. Either passed in or figured out by NILEDB_API_URL
   * process.env.NILEDB_ID
   */
  databaseId?: string;

  /**
   * The user UUID to the database
   * process.env.NILEDB_USER
   */
  user?: string;

  /**
   * The password UUID to the database
   * process.env.NILEDB_PASSWORD
   */
  password?: string;

  /**
   * The name of the database. Automatically obtained from NILEDB_POSTGRES_URL
   * process.env.NILEDB_NAME
   */
  databaseName?: string;

  /**
   * A tenant id. Scopes requests to a specific tenant, both API and DB
   * process.env.NILEDB_TENANT
   */
  tenantId?: string | null | undefined;

  /**
   * A user id. Possibly not the logged in user, used for setting database context (nile.user_id)
   * Generally speaking, this wouldn't be used for authentication, and in some cases simply won't do anything on some endpoints
   */
  userId?: string | null | undefined;
  /**
   * Shows a bunch of logging on the server side to see what's being done between the sdk and nile-auth
   */
  debug?: boolean;

  /**
   * DB configuration overrides. Environment variables are the way to go, but maybe you need something more
   */
  db?: NilePoolConfig;

  /**
   * Some kind of logger if you want to send to an external service
   */
  logger?: LoggerType;

  /**
   * The configuration value that maps to `NILEDB_API_URL` - its going to be nile-auth (or similar service)
   */
  apiUrl?: string | undefined;

  /**
   * Ignore client callbackUrls by setting this.
   * You can force the callback URL server side to be sure nile-auth redirects to whatever location.
   */
  callbackUrl?: string | undefined;

  /**
   * Need to override some routes? Change it here
   */
  routes?: Partial<Routes>;

  /**
   * don't like the default `/api`? change it here
   */
  routePrefix?: string | undefined;

  /**
   * In some cases, you may want to force secure cookies.
   * The SDK handles this for you, but might be necessary in some firewall / internal cases
   */
  secureCookies?: boolean;

  /**
   * The origin for the requests.
   * Allows the setting of the callback origin to a random FE
   * eg FE localhost:3001 -> BE: localhost:5432 would set to localhost:3001 to be sure nile-auth uses that.
   * In full stack cases, will just be the `host` header of the incoming request, which is used by default
   */
  origin?: null | undefined | string;

  /**
   * Set the headers to use in API requests.
   * The `cookie` would be expected if you are setting this, else most calls will be unauthorized
   */
  headers?: null | Headers | Record<string, string>;
};

export type NileDb = NilePoolConfig & { tenantId?: string };

export type AfterCreate = (
  conn: PoolClient,
  done: (err: null | Error, conn: PoolClient) => void
) => void;
