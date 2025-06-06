import { Config } from './Config';
import { TENANT_COOKIE, USER_COOKIE } from './constants';

function getTokenFromCookie(headers: Headers, cookieKey: void | string) {
  const cookie = headers.get('cookie')?.split('; ');
  const _cookies: Record<string, string> = {};
  if (cookie) {
    for (const parts of cookie) {
      const cookieParts = parts.split('=');
      const _cookie = cookieParts.slice(1).join('=');
      const name = cookieParts[0];
      _cookies[name] = _cookie;
    }
  }

  if (cookie) {
    for (const parts of cookie) {
      const cookieParts = parts.split('=');
      const _cookie = cookieParts.slice(1).join('=');
      const name = cookieParts[0];
      _cookies[name] = _cookie;
    }
  }
  if (cookieKey) {
    return _cookies[cookieKey];
  }
  return null;
}
export function getTenantFromHttp(headers: Headers, config: Config) {
  const cookieTenant = getTokenFromCookie(headers, TENANT_COOKIE);

  return cookieTenant ? cookieTenant : config?.tenantId;
}

// do we do this any more?
export function getUserFromHttp(headers: Headers, config: Config) {
  const userHeader = headers?.get(USER_COOKIE);
  return userHeader ? userHeader : config.userId;
}
