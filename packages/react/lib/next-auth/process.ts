import type { AuthClientConfig } from 'next-auth/client/_utils';
// This behaviour mirrors the default behaviour for getting the site name that
// happens server side in server/index.js
// 1. An empty value is legitimate when the code is being invoked client side as
//    relative URLs are valid in that context and so defaults to empty.
// 2. When invoked server side the value is picked up from an environment
//    variable and defaults to 'http://localhost:3000'.

const env = typeof process !== 'undefined' ? process?.env : {};
export const __NEXTAUTH: AuthClientConfig = {
  baseUrl: parseUrl(env.NEXTAUTH_URL ?? env.VERCEL_URL).origin,
  basePath: parseUrl(env.NEXTAUTH_URL).path,
  baseUrlServer: parseUrl(
    env.NEXTAUTH_URL_INTERNAL ?? env.NEXTAUTH_URL ?? env.VERCEL_URL
  ).origin,
  basePathServer: parseUrl(env.NEXTAUTH_URL_INTERNAL ?? env.NEXTAUTH_URL).path,
  _lastSync: 0,
  _session: undefined,
  _getSession: () => undefined,
};
export const NODE_ENV = env.NODE_ENV;

/** Returns an `URL` like object to make requests/redirects from server-side */
function parseUrl(url?: string): InternalUrl {
  const defaultUrl = new URL('http://localhost:3000/api/auth');

  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  const _url = new URL(url ?? defaultUrl);
  const path = (_url.pathname === '/' ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, '');

  const base = `${_url.origin}${path}`;

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  };
}

export interface InternalUrl {
  /** @default "http://localhost:3000" */
  origin: string;
  /** @default "localhost:3000" */
  host: string;
  /** @default "/api/auth" */
  path: string;
  /** @default "http://localhost:3000/api/auth" */
  base: string;
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string;
}
