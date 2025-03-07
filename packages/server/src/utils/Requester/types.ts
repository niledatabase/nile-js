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
