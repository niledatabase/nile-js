import { PoolClient, PoolConfig } from 'pg';

import { Routes } from './api/types';
import { Server } from './Server';
import { LogReturn } from './utils/Logger';

export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
type Any = any;
export type ExtensionResult = {
  id: string;
  // Called before request is handled
  onRequest?: (...params: Any) => void | Promise<void | RequestInit>;

  // Called after response is generated - probably a response
  onResponse?: (...params: Any) => void | Promise<void>;

  // called before requests to nile-auth, before onRequest
  // used for making sure the request is an actual `Request` object (or handles otherwise)
  onHandleRequest?: (...params: Any) => RouteReturn | Promise<RouteReturn>;

  // allow runtime configurations by extensions
  onConfigure?: (...params: Any) => void;

  // maybe any function at all is a set context, who knows
  onSetContext?: (...params: Any) => void;

  // maybe any function at all is get context, who knows
  onGetContext?: () => Any;
};

export type Extension = (instance: Server) => ExtensionResult;
export enum ExtensionState {
  onHandleRequest = 'onHandleRequest',
  onRequest = 'onRequest',
  onResponse = 'onResponse',
}
export type NilePoolConfig = PoolConfig & { afterCreate?: AfterCreate };
export type LoggerType = {
  info: (args: unknown | unknown[]) => void;
  warn: (args: unknown | unknown[]) => void;
  error: (args: unknown | unknown[]) => void;
  debug: (args: unknown | unknown[]) => void;
};

/**
 * Configuration options used by the {@link Server} class.
 * Most values can be provided via environment variables if not set here.
 */
export type NileConfig = {
  /**
   * Unique ID of the database.
   * If omitted, the value is derived from `NILEDB_API_URL`.
   * Environment variable: `NILEDB_ID`.
   */
  databaseId?: string;

  /**
   * Database user used for authentication.
   * Environment variable: `NILEDB_USER`.
   */
  user?: string;

  /**
   * Password for the configured user.
   * Environment variable: `NILEDB_PASSWORD`.
   */
  password?: string;

  /**
   * Database name. Defaults to the name parsed from
   * `NILEDB_POSTGRES_URL` when not provided.
   * Environment variable: `NILEDB_NAME`.
   */
  databaseName?: string;

  /**
   * Tenant context used for scoping API and DB calls.
   * Environment variable: `NILEDB_TENANT`.
   */
  tenantId?: string | null | undefined;

  /**
   * Optional user identifier to apply when interacting with the database.
   * In most cases nile-auth injects the logged in user automatically so this
   * value rarely needs to be specified directly. It can be useful when
   * performing administrative actions on behalf of another user.
   */
  userId?: string | null | undefined;
  /** Enable verbose logging of SDK behaviour. */
  debug?: boolean;

  /**
   * Optional Postgres connection configuration.
   * Environment variables will be used for any values not set here.
   */
  db?: NilePoolConfig;

  /** Custom logger implementation. */
  logger?: LogReturn;

  /**
   * Base URL for nile-auth requests.
   * Environment variable: `NILEDB_API_URL`.
   */
  apiUrl?: string | undefined;

  /**
   * Override the client provided callback URL during authentication.
   * Environment variable: `NILEDB_CALLBACK_URL`.
   */
  callbackUrl?: string | undefined;

  /** Override default API routes. */
  routes?: Partial<Routes>;

  /** Prefix applied to all generated routes. */
  routePrefix?: string | undefined;

  /**
   * Force usage of secure cookies when communicating with nile-auth.
   * Defaults to `true` when `NODE_ENV` is `production`.
   * Environment variable: `NILEDB_SECURECOOKIES`.
   */
  secureCookies?: boolean;

  /**
   * Origin for requests made to nile-auth. This controls where users are
   * redirected after authentication. For single-page apps running on a
   * different port than the API, set this to the front-end origin
   * (e.g. `http://localhost:3001`). In a full-stack setup the value defaults
   * to the `host` header of the incoming request. When using secure cookies on
   * server-to-server calls, explicitly setting the origin ensures nile-auth
   * knows whether TLS is being used and which cookies to send.
   */
  origin?: null | undefined | string;

  /**
   * Additional headers sent with every API request.
   * Include a `cookie` header to forward session information.
   */
  headers?: null | Headers | Record<string, string>;
  /** Hooks executed before and after each request. */
  extensions?: Extension[];

  /**
   * Preserve incoming request headers when running extensions.
   */
  preserveHeaders?: boolean;
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

type ExtensionConfig = { disableExtensions: string[] };
export type RouteReturn = void | Request | Response | ExtensionState;
export type RouteFunctions = {
  GET: (
    req: Request,
    config?: ExtensionConfig,
    ...args: unknown[]
  ) => Promise<RouteReturn>;
  POST: (req: Request, config?: ExtensionConfig) => Promise<RouteReturn>;
  DELETE: (req: Request, config?: ExtensionConfig) => Promise<RouteReturn>;
  PUT: (req: Request, config?: ExtensionConfig) => Promise<RouteReturn>;
};
type ContextReturn = {
  response: RouteReturn;
  nile: Server;
};
export type CTXHandlerType = {
  GET: (req: Request) => Promise<ContextReturn>;
  POST: (req: Request) => Promise<ContextReturn>;
  DELETE: (req: Request) => Promise<ContextReturn>;
  PUT: (req: Request) => Promise<ContextReturn>;
};
