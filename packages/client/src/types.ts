/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage } from 'http';

export interface SignInResponse {
  data?: {
    expiresAt: Date;
    method: 'authenticator' | 'email';
    otpauthUrl: string;
    scope: 'setup' | 'challenge';
    secret: 'string';
    token: 'string';
  };
  error: string | null;
  status: number;
  ok: boolean;
  url: string | null;
}

export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>);
export interface SignInOptions extends Record<string, unknown> {
  /**
   * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
   *
   * [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl)
   */
  callbackUrl?: string;
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option) */
  redirect?: boolean;
}

export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export type ProviderType = 'oauth' | 'email' | 'credentials';
export interface ClientSafeProvider {
  id: LiteralUnion<BuiltInProviderType>;
  name: string;
  type: ProviderType;
  signinUrl: string;
  callbackUrl: string;
}

export type RedirectableProviderType = 'email' | 'credentials';
type OAuthProviderType =
  | 'linkedin'
  | 'hubspot'
  | 'google'
  | 'azure-ad'
  | 'slack'
  | 'github'
  | 'twitter'
  | 'discord';
export type BuiltInProviderType = RedirectableProviderType | OAuthProviderType;
export type JWT = {
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
};
export type ActiveSession = {
  loading?: boolean;
  id: string;
  email: string;
  expires: string;
  user?: {
    id: string;
    name: string;
    image: string;
    email: string;
    emailVerified: void | Date;
  };
};

export type NonErrorSession = JWT | ActiveSession | null | undefined;
export type NileSession = Response | NonErrorSession;

export type AuthState = {
  basePath: string;
  baseUrl: string;
  lastSync: number;
  getSession: (...args: any[]) => void;
  session: NonErrorSession | undefined | null;
  loading: boolean;
};

export type ListenerParams = {
  key: ListenerKeys;
  next: any;
  prev: any;
};
export type Listener = (callback: ListenerParams) => void;
export type ListenerKeys =
  | 'basePath'
  | 'baseUrl'
  | 'lastSync'
  | 'getSession'
  | 'session'
  | 'loading';

export type AuthConfig = Config & {
  listenerKeys?: Array<ListenerKeys>;
};

export type Config = {
  basePath?: string;
  baseUrl?: string;
  init?: RequestInit;
};
export type PartialAuthorizer = null | {
  state?: {
    baseUrl?: string;
    basePath?: string;
    session?: {
      user?: { email?: string | undefined };
    };
  };
  requestInit?: RequestInit | undefined;
};

export interface CtxOrReq {
  req?: Partial<IncomingMessage> & { body?: any };
  ctx?: { req: Partial<IncomingMessage> & { body?: any } };
}

export interface SignOutParams<R extends boolean = true> {
  callbackUrl?: string;
  redirect?: R;
}

export interface SignOutResponse {
  url: string;
}
