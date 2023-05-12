import { ResponseError } from './ResponseError';
import { Config } from './Config';

function getToken(headers: Headers, cookieKey: string) {
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
  return _cookies[cookieKey];
}

export async function _fetch(
  config: Config,
  path: string,
  opts?: RequestInit
): Promise<Response | ResponseError> {
  const url = `${config.basePath}${path}`;
  const { cookieKey } = config;
  const headers = new Headers(opts?.headers);
  headers.set('content-type', 'application/json; charset=utf-8');

  const token = getToken(headers, cookieKey);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, opts);

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
