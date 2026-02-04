import { PartialContext } from '../types';

import { TENANT_COOKIE, USER_COOKIE } from './constants';

function getTokenFromCookie(headers: Headers, cookieKey: void | string) {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split('; ');
  for (const parts of cookies) {
    const cookieParts = parts.split('=');
    const name = cookieParts[0];
    const value = cookieParts.slice(1).join('=');

    if (cookieKey && name === cookieKey) {
      return value;
    }
  }

  return null;
}
export function getTenantFromHttp(headers: Headers, context?: PartialContext) {
  const cookieTenant = getTokenFromCookie(headers, TENANT_COOKIE);

  return cookieTenant ? cookieTenant : context?.tenantId;
}

// do we do this any more?
export function getUserFromHttp(headers: Headers, context?: PartialContext) {
  const userHeader = headers?.get(USER_COOKIE);
  return userHeader ? userHeader : context?.userId;
}
