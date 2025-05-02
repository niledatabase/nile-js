import { Config } from '../../../utils/Config';

import { makeRestUrl } from './makeRestUrl';

export enum ProxyNileAuthRoutes {
  CSRF = '/auth/csrf',
  PROVIDERS = '/auth/providers',
  SESSION = '/auth/session',
  SIGNIN = '/auth/signin',
  CALLBACK = '/auth/callback',
  SIGNOUT = '/auth/signout',
}
export const proxyRoutes = (config: Config) => ({
  SIGNIN: makeRestUrl(config, ProxyNileAuthRoutes.SIGNIN),
  PROVIDERS: makeRestUrl(config, ProxyNileAuthRoutes.PROVIDERS),
  SESSION: makeRestUrl(config, ProxyNileAuthRoutes.SESSION),
  CSRF: makeRestUrl(config, ProxyNileAuthRoutes.CSRF),
  CALLBACK: makeRestUrl(config, ProxyNileAuthRoutes.CALLBACK),
  SIGNOUT: makeRestUrl(config, ProxyNileAuthRoutes.SIGNOUT),
  ERROR: makeRestUrl(config, '/auth/error'),
  VERIFY_REQUEST: makeRestUrl(config, '/auth/verify-request'),
  PASSWORD_RESET: makeRestUrl(config, '/auth/reset-password'),
});

type ProxyKeys = keyof typeof proxyRoutes;

export type ProxyPaths = (typeof proxyRoutes)[ProxyKeys];
