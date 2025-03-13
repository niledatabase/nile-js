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

type ActiveSession = {
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
type ListenerKeys =
  | 'basePath'
  | 'baseUrl'
  | 'lastSync'
  | 'getSession'
  | 'session'
  | 'loading';
export type AuthConfig = {
  basePath: string;
  baseUrl: string;
  listenerKeys: Array<ListenerKeys>;
};
