import { RequestCookie, RequestCookies } from '@edge-runtime/cookies';

import { ResponseError } from './ResponseError';
import { Config } from './Config';

export async function _fetch(config: Config, path: string, opts?: RequestInit) {
  const url = `${config.basePath}${path}`;
  const { cookieKey } = config;
  const headers = new Headers(opts?.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  const cookies = new RequestCookies(headers);
  const token = cookies.get(cookieKey as unknown as RequestCookie)?.value;

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
