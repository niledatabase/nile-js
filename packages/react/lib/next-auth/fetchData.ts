/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerInstance } from 'next-auth';
import { AuthClientConfig, CtxOrReq } from 'next-auth/client/_utils';

export type FetchInit = CtxOrReq & { init?: RequestInit };
export async function fetchData<T = any>(
  path: string,
  __NEXTAUTH: AuthClientConfig,
  logger: LoggerInstance,
  { ctx, req = ctx?.req, init }: FetchInit = {}
): Promise<T | null> {
  const url = `${apiBaseUrl(__NEXTAUTH)}/${path}`;
  try {
    const options: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(req?.headers?.cookie ? { cookie: req.headers.cookie } : {}),
      },
      ...(init ? init : {}),
    };

    if (req?.body) {
      options.body = JSON.stringify(req.body);
      options.method = 'POST';
    }

    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw data;
    return Object.keys(data).length > 0 ? data : null; // Return null if data empty
  } catch (error) {
    logger.error('CLIENT_FETCH_ERROR', { error: error as Error, url });
    return null;
  }
}

// if your client and server are in different places
export function apiBaseUrl(__NEXTAUTH: AuthClientConfig) {
  return `${__NEXTAUTH.baseUrlServer}${__NEXTAUTH.basePathServer}`;
}
