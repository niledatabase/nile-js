import { ResponseError } from './ResponseError';
import { Config } from './Config';
import { NileRequest } from './Requester';

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

export async function _fetch(
  config: Config,
  path: string,
  opts?: RequestInit
): Promise<Response | ResponseError> {
  const url = `${config.api?.basePath}${path}`;
  const cookieKey = config.api?.cookieKey;
  const headers = new Headers(opts?.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  const authHeader = headers.get('Authorization');
  if (!authHeader) {
    if (config.api?.token) {
      headers.set('Authorization', `Bearer ${config.api?.token}`);
    } else {
      const token = getTokenFromCookie(headers, cookieKey);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }

  const response = await fetch(url, {
    ...opts,
    headers,
  });

  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let res;
  try {
    res = await response.json();
  } catch (e) {
    /* do the default */
  }
  if (res && 'message' in res) {
    const { message } = res;
    return new ResponseError(message, { status: 400 });
  }

  return new ResponseError(null, { status: response.status });
}
