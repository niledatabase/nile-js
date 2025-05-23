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
export type NileConfig = {
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
   * Defaults to true if you're in production
   */
  secureCookies?: boolean;

  /**
   * The origin for the requests.
   * Allows the setting of the callback origin to a random FE
   * eg FE localhost:3001 -> BE: localhost:5432 would set to localhost:3001 to be sure nile-auth uses that.
   * In full stack cases, will just be the `host` header of the incoming request, which is used by default
   * It is also important to set this when dealing with secure cookies. Calling via server side needs to know if TLS is being used so that nile-auth knows which cookies to be sent.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

// taken from ts lib dom
interface NileBody<R, B> {
  readonly body: ReadableStream<Uint8Array> | null | B;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<R>;
  text(): Promise<string>;
}

interface NResponse<T> extends NileBody<T, any> {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  clone(): Response;
}

interface NRequest<T> extends NileBody<any, T> {
  /** Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching. */
  readonly cache: RequestCache;
  /** Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. */
  readonly credentials: RequestCredentials;
  /** Returns the kind of resource requested by request, e.g., "document" or "script". */
  readonly destination: RequestDestination;
  /** Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header. */
  readonly headers: Headers;
  /** Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI] */
  readonly integrity: string;
  /** Returns a boolean indicating whether or not request can outlive the global in which it was created. */
  readonly keepalive: boolean;
  /** Returns request's HTTP method, which is "GET" by default. */
  readonly method: string;
  /** Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs. */
  readonly mode: RequestMode;
  /** Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  readonly redirect: RequestRedirect;
  /** Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init, the empty string to indicate no referrer, and "about:client" when defaulting to the global's default. This is used during fetching to determine the value of the `Referer` header of the request being made. */
  readonly referrer: string;
  /** Returns the referrer policy associated with request. This is used during fetching to compute the value of the request's referrer. */
  readonly referrerPolicy: ReferrerPolicy;
  /** Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler. */
  readonly signal: AbortSignal;
  /** Returns the URL of request as a string. */
  readonly url: string;
  clone(): Request;
}

export type NileRequest<T> = NRequest<T> | T;

export const APIErrorErrorCodeEnum = {
  InternalError: 'internal_error',
  BadRequest: 'bad_request',
  EntityNotFound: 'entity_not_found',
  DuplicateEntity: 'duplicate_entity',
  InvalidCredentials: 'invalid_credentials',
  UnknownOidcProvider: 'unknown_oidc_provider',
  ProviderAlreadyExists: 'provider_already_exists',
  ProviderConfigError: 'provider_config_error',
  ProviderMismatch: 'provider_mismatch',
  ProviderUpdateError: 'provider_update_error',
  SessionStateMissing: 'session_state_missing',
  SessionStateMismatch: 'session_state_mismatch',
  OidcCodeMissing: 'oidc_code_missing',
} as const;
export type APIErrorErrorCodeEnum =
  (typeof APIErrorErrorCodeEnum)[keyof typeof APIErrorErrorCodeEnum];

export interface APIError {
  [key: string]: any | any;
  /**
   *
   * @type {string}
   * @memberof APIError
   */
  errorCode: APIErrorErrorCodeEnum;
  /**
   *
   * @type {string}
   * @memberof APIError
   */
  message: string;
  /**
   *
   * @type {number}
   * @memberof APIError
   */
  statusCode: number;
}

export type NileResponse<T> = Promise<T | NResponse<T & APIError>>;
