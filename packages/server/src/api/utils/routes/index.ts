import { Routes } from '../../types';
import { Config } from '../../../utils/Config';

const NILEDB_API_URL = process.env.NILEDB_API_URL;
export const DEFAULT_PREFIX = '/api';

export enum DefaultNileAuthRoutes {
  SIGNUP = '/signup',
  TENANTS = '/tenants',
  TENANT = '/tenants/{tenantId}',
  USER_TENANTS = '/users/{userId}/tenants',
  TENANT_USER = '/tenants/{tenantId}/users/{userId}',
  TENANT_USERS = '/tenants/{tenantId}/users',
  USER = '/users/{userId}',
  USERS = '/users',
  ME = '/me',
}

export enum NileAuthRoutes {
  CSRF = '/auth/csrf',
  PROVIDERS = '/auth/providers',
  SESSION = '/auth/session',
  SIGNIN = '/auth/signin',
  CALLBACK = '/auth/callback',
  SIGNOUT = '/auth/signout',
  PASSWORD_RESET = '/auth/reset-password',
  VERIFY_EMAIL = '/auth/verify-email',
}

// these map to the developer app
export const appRoutes = (prefix = DEFAULT_PREFIX): Routes => ({
  SIGNIN: `${prefix}${NileAuthRoutes.SIGNIN}`,
  PROVIDERS: `${prefix}${NileAuthRoutes.PROVIDERS}`,
  SESSION: `${prefix}${NileAuthRoutes.SESSION}`,
  CSRF: `${prefix}${NileAuthRoutes.CSRF}`,
  CALLBACK: `${prefix}${NileAuthRoutes.CALLBACK}`,
  SIGNOUT: `${prefix}${NileAuthRoutes.SIGNOUT}`,
  ERROR: `${prefix}/auth/error`,
  VERIFY_REQUEST: `${prefix}/auth/verify-request`,
  VERIFY_EMAIL: `${prefix}${NileAuthRoutes.VERIFY_EMAIL}`,
  PASSWORD_RESET: `${prefix}${NileAuthRoutes.PASSWORD_RESET}`,
  ME: `${prefix}${DefaultNileAuthRoutes.ME}`,
  USERS: `${prefix}${DefaultNileAuthRoutes.USERS}`,
  USER_TENANTS: `${prefix}${DefaultNileAuthRoutes.USER_TENANTS}`,
  TENANTS: `${prefix}${DefaultNileAuthRoutes.TENANTS}`,
  TENANT: `${prefix}${DefaultNileAuthRoutes.TENANT}`,
  TENANT_USER: `${prefix}${DefaultNileAuthRoutes.TENANT_USER}`,
  TENANT_USERS: `${prefix}${DefaultNileAuthRoutes.TENANT_USERS}`,
  SIGNUP: `${prefix}${DefaultNileAuthRoutes.SIGNUP}`,
  LOG: `${prefix}/_log`,
});

// these map to nile-auth
export const apiRoutes = (config: Config) => ({
  ME: makeRestUrl(config, '/me'),
  USERS: (qp: { tenantId?: null | string; newTenantName?: null | string }) =>
    makeRestUrl(config, '/users', qp),
  USER: (userId: string) => makeRestUrl(config, `/users/${userId}`),
  TENANTS: makeRestUrl(config, '/tenants'),
  TENANT: (tenantId: string) => makeRestUrl(config, `/tenants/${tenantId}`),
  SIGNUP: makeRestUrl(config, '/signup'),
  TENANT_USERS: (tenantId: string) =>
    makeRestUrl(config, `/tenants/${tenantId}/users`),
  TENANT_USER: makeRestUrl(
    config,
    `/tenants/${config.tenantId}/users/${config.userId}`
  ),
  USER_TENANTS: (userId: string) =>
    makeRestUrl(config, `/users/${userId}/tenants`),
});
type ApiRouteKeys = keyof typeof apiRoutes;
export type ApiRoutePaths = (typeof apiRoutes)[ApiRouteKeys];

// these map to nile-auth
export const proxyRoutes = (config: Config) => ({
  SIGNIN: makeRestUrl(config, NileAuthRoutes.SIGNIN),
  PROVIDERS: makeRestUrl(config, NileAuthRoutes.PROVIDERS),
  SESSION: makeRestUrl(config, NileAuthRoutes.SESSION),
  CSRF: makeRestUrl(config, NileAuthRoutes.CSRF),
  CALLBACK: makeRestUrl(config, NileAuthRoutes.CALLBACK),
  SIGNOUT: makeRestUrl(config, NileAuthRoutes.SIGNOUT),
  ERROR: makeRestUrl(config, '/auth/error'),
  VERIFY_REQUEST: makeRestUrl(config, '/auth/verify-request'),
  PASSWORD_RESET: makeRestUrl(config, NileAuthRoutes.PASSWORD_RESET),
  VERIFY_EMAIL: makeRestUrl(config, NileAuthRoutes.VERIFY_EMAIL),
});
type ProxyKeys = keyof typeof proxyRoutes;
export type ProxyPaths = (typeof proxyRoutes)[ProxyKeys];

function filterNullUndefined(
  obj?: Record<string, string | null>
): { [k: string]: string | null } | undefined {
  if (!obj) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined
    )
  );
}

export function makeRestUrl(
  config: Config,
  path: string,
  qp?: Record<string, string | null>
) {
  const url = config.apiUrl || NILEDB_API_URL;
  if (!url) {
    throw new Error(
      'An API url is required. Set it via NILEDB_API_URL. Was auto configuration run?'
    );
  }
  const params = new URLSearchParams(
    filterNullUndefined(qp) as Record<string, string>
  );
  const strParams = params.toString();
  return `${[url, path.substring(1, path.length)].join('/')}${
    strParams ? `?${strParams}` : ''
  }`;
}

export function urlMatches(requestUrl: string, route: string) {
  const url = new URL(requestUrl);
  return url.pathname.startsWith(route);
}
export function prefixAppRoute(config: Config) {
  return `${config.origin}${config.routePrefix}`;
}

export function isUUID(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  // is any UUID
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5|7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  return regex.test(value);
}
