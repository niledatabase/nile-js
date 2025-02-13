import { decodeJwt } from 'jose';

import { ResponseError } from './ResponseError';
import { Config } from './Config';
import { NileRequest } from './Requester';
import { updateTenantId, updateUserId } from './Event';
import { getToken } from './Config/envVars';
import Logger from './Logger';

export const X_NILE_TENANT = 'niledb-tenant-id';
export const X_NILE_USER_ID = 'niledb-user-id';
export const X_NILE_SECURECOOKIES = 'niledb-useSecureCookies';

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
export function getTenantFromHttp(headers: Headers, config?: Config) {
  const cookieTenant = getTokenFromCookie(headers, X_NILE_TENANT);
  return cookieTenant ?? headers?.get(X_NILE_TENANT) ?? config?.tenantId;
}

export function getUserFromHttp(headers: Headers, config: Config) {
  const token = getTokenFromCookie(headers, config.api.cookieKey);
  if (token) {
    const jwt = decodeJwt(token);
    return jwt.sub;
  }
  return headers?.get(X_NILE_USER_ID) ?? config.userId;
}

export function makeBasicHeaders(config: Config, opts?: RequestInit) {
  const headers = new Headers(opts?.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  const cookieKey = config.api?.cookieKey;

  // the sdk server side calls use this
  const authHeader = headers.get('Authorization');
  if (!authHeader) {
    const token = getTokenFromCookie(headers, cookieKey);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (getToken({ config })) {
      headers.set('Authorization', `Bearer ${getToken({ config })}`);
    }
  }
  if (config.secureCookies) {
    headers.set(X_NILE_SECURECOOKIES, 'true');
  }
  return headers;
}

export async function _fetch(
  config: Config,
  path: string,
  opts?: RequestInit
): Promise<Response | ResponseError> {
  const { debug, error } = Logger(config, '[server]');

  const url = `${config.api?.basePath}${path}`;
  const headers = new Headers(opts?.headers);
  const tenantId = getTenantFromHttp(headers, config);
  const basicHeaders = makeBasicHeaders(config, opts);
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

  debug(`[fetch] ${useableUrl}`);

  try {
    const response = await fetch(useableUrl, {
      ...opts,
      headers: basicHeaders,
    }).catch((e) => {
      error('[fetch][response]', {
        message: e.message,
        stack: e.stack,
        debug: 'Is nile-auth running?',
      });
      return new Error(e);
    });

    if (response instanceof Error) {
      return new ResponseError('Failed to connect to database', {
        status: 400,
      });
    }
    if (response && response.status >= 200 && response.status < 300) {
      if (typeof response.clone === 'function') {
        try {
          debug(
            `[fetch][response][${opts?.method ?? 'GET'}] ${
              response.status
            } ${useableUrl}`,
            {
              body: await response.clone().json(),
            }
          );
        } catch (e) {
          debug(
            `[fetch][response][${opts?.method ?? 'GET'}] ${
              response.status
            } ${useableUrl}`,
            {
              body: await response.clone().text(),
            }
          );
        }
      }
      return response;
    }
    if (response?.status === 404) {
      return new ResponseError('Not found', { status: 404 });
    }

    if (response?.status === 401) {
      return new ResponseError('Unauthorized', { status: 401 });
    }
    if (response?.status === 405) {
      return new ResponseError('Method not allowed', { status: 405 });
    }
    let res;
    const errorHandler =
      typeof response?.clone === 'function' ? response.clone() : null;
    let msg = '';
    try {
      res = await (response as Response)?.json();
    } catch (e) {
      if (errorHandler) {
        msg = await errorHandler.text();
        if (msg) {
          error(`[fetch][response][status: ${errorHandler.status}]`, {
            message: msg,
          });
        }
        return e as ResponseError;
      }
      if (!msg) {
        error('[fetch][response]', { e });
      }
    }
    if (msg) {
      return new ResponseError(msg, { status: errorHandler?.status });
    }

    if (res && 'message' in res) {
      const { message } = res;
      error(`[fetch][response][status: ${errorHandler?.status}] ${message}`);
      return new ResponseError(message, { status: 400 });
    }
    if (res && 'errors' in res) {
      const {
        errors: [message],
      } = res;
      error(`[fetch][response] [status: ${errorHandler?.status}] ${message}`);
      return new ResponseError(message, { status: 400 });
    }
    error(
      `[fetch][response][status: ${errorHandler?.status}] UNHANDLED ERROR`,
      {
        res,
      }
    );
    return new ResponseError(null, {
      status: (response as Response)?.status ?? 500,
    });
  } catch (e) {
    return new ResponseError('an unexpected error has occurred', {
      status: 500,
    });
  }
}
