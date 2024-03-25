import { decodeJwt } from 'jose';

import { ResponseError } from './ResponseError';
import { Config } from './Config';
import { NileRequest } from './Requester';
import { updateTenantId, updateUserId } from './Event';

export const X_NILE_TENANT = 'x-nile-tenantId';
export const X_NILE_USER_ID = 'x-nile-userId';

export function handleTenantId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: NileRequest<any>,
  config: Config
): ResponseError | void {
  // already set, no need to try and figure it out
  if (config.tenantId) {
    return;
  }
  return new ResponseError('tenant id needs to be set', { status: 400 });
}

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
  const cookieTenant = getTokenFromCookie(headers, 'tenantId');
  return cookieTenant ?? headers?.get(X_NILE_TENANT) ?? config.tenantId;
}

export function getUserFromHttp(headers: Headers, config: Config) {
  const token = getTokenFromCookie(headers, config.api.cookieKey);
  if (token) {
    const jwt = decodeJwt(token);
    return jwt.sub;
  }
  return headers?.get(X_NILE_USER_ID) ?? config.userId;
}

export async function _fetch(
  config: Config,
  path: string,
  opts?: RequestInit
): Promise<Response | ResponseError> {
  const url = `${config.api?.basePath}${path}`;
  const cookieKey = config.api?.cookieKey;
  const headers = new Headers(opts?.headers);
  const basicHeaders = new Headers();
  basicHeaders.set('content-type', 'application/json; charset=utf-8');
  const authHeader = headers.get('Authorization');
  if (!authHeader) {
    const token = getTokenFromCookie(headers, cookieKey);
    if (token) {
      basicHeaders.set('Authorization', `Bearer ${token}`);
    } else if (config.api?.token) {
      basicHeaders.set('Authorization', `Bearer ${config.api?.token}`);
    }
  }

  const tenantId = getTenantFromHttp(headers, config);
  updateTenantId(tenantId);
  const userId = getUserFromHttp(headers, config);
  updateUserId(userId);
  if (url.includes('{tenantId}') && !tenantId) {
    return new ResponseError('tenantId is not set for request', {
      status: 400,
    });
  }
  const useableUrl = url
    .replace('{tenantId}', encodeURIComponent(String(tenantId)))
    .replace('{userId}', encodeURIComponent(String(userId)));
  const response = await fetch(useableUrl, {
    ...opts,
    headers: basicHeaders,
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e);
  });

  if (response && response.status >= 200 && response.status < 300) {
    return response;
  }

  let res;
  try {
    res = await (response as Response)?.json();
  } catch (e) {
    /* do the default */
  }
  if (res && 'message' in res) {
    const { message } = res;
    return new ResponseError(message, { status: 400 });
  }
  if (res && 'errors' in res) {
    const {
      errors: [message],
    } = res;
    return new ResponseError(message, { status: 400 });
  }

  return new ResponseError(null, {
    status: (response as Response)?.status ?? 500,
  });
}
