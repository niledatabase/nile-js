/* eslint-disable @typescript-eslint/no-explicit-any */
export type JWT = {
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
  loading: boolean;
};

export type ActiveSession = {
  loading: boolean;
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
    session?: {
      user?: { email?: string | undefined };
    };
  };
  requestInit?: RequestInit | undefined;
};
