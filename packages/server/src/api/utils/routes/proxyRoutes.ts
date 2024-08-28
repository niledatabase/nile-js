import { Config } from '../../../utils/Config';

import { makeRestUrl } from './makeRestUrl';

export const proxyRoutes = (config: Config) => ({
  SIGNIN: makeRestUrl(config, '/auth/signin'),
  PROVIDERS: makeRestUrl(config, '/auth/providers'),
  SESSION: makeRestUrl(config, '/auth/session'),
  CSRF: makeRestUrl(config, '/auth/csrf'),
  CALLBACK: makeRestUrl(config, '/auth/callback'),
  SIGNOUT: makeRestUrl(config, '/auth/signout'),
  ERROR: makeRestUrl(config, '/auth/error'),
});

type ProxyKeys = keyof typeof proxyRoutes;

export type ProxyPaths = (typeof proxyRoutes)[ProxyKeys];
