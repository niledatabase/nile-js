/** Options for {@link Nile.constructor} */
export interface NileConfig {
  apiUrl: string;
}

/** Payload for {@link Nile.signIn} */
export interface NileSignIn {
  email: string;
  password: string;
}
export interface User {
  name: string;
}
export interface AuthResponse {
  token: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type LiteralUnion<T extends U, U = string> = T | (U & {});

export declare type CreateableEntities = LiteralUnion<
  'login' | 'users' | 'orgs'
>;
export declare type UpdatableEntities = LiteralUnion<'user'>;
export declare type ReadableEntities = LiteralUnion<'user' | 'users' | 'orgs'>;

export interface APIResponse extends Response {
  [key: string]: unknown;
}

export type ApiRequestOptions = {
  readonly method:
    | 'GET'
    | 'PUT'
    | 'POST'
    | 'DELETE'
    | 'OPTIONS'
    | 'HEAD'
    | 'PATCH';
  readonly url: string;
  readonly path?: Record<string, unknown>;
  readonly cookies?: Record<string, unknown>;
  readonly headers?: Record<string, unknown>;
  readonly query?: Record<string, unknown>;
  readonly formData?: Record<string, unknown>;
  readonly body?: unknown;
  readonly mediaType?: string;
  readonly responseHeader?: string;
  readonly errors?: Record<number, string>;
};
