import { makeRestUrl } from './makeRestUrl';

export const proxyRoutes = {
  SIGNIN: makeRestUrl('/auth/signin'),
  PROVIDERS: makeRestUrl('/auth/providers'),
  SESSION: makeRestUrl('/auth/session'),
  CSRF: makeRestUrl('/auth/csrf'),
  CALLBACK: makeRestUrl('/auth/callback'),
  SIGNOUT: makeRestUrl('/auth/signout'),
  ERROR: makeRestUrl('/auth/error'),
};

type ProxyKeys = keyof typeof proxyRoutes;

export type ProxyPaths = (typeof proxyRoutes)[ProxyKeys];
