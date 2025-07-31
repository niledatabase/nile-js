import { fetchCsrf } from '../api/routes/auth/csrf';
import { updateHeaders } from '../utils/Event';
import { Config } from '../utils/Config';
import { ctx } from '../api/utils/request-context';

import { parseCallback, parseCSRF, parseToken } from '.';

export default async function obtainCsrf<T = Response | { csrfToken: string }>(
  config: Config,
  rawResponse = false
) {
  const { headers } = ctx.get();
  const res = await fetchCsrf(config);
  // we're gonna use it, so set the headers now.
  const csrfCook = parseCSRF(res.headers);

  // prefer the csrf from the headers over the saved one
  if (csrfCook) {
    const [, value] = csrfCook.split('=');
    const [token] = decodeURIComponent(value).split('|');

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const cookie = [
        csrfCook,
        parseCallback(res.headers),
        parseToken(res.headers),
      ]
        .filter(Boolean)
        .join('; ');
      headers.set('cookie', cookie);
      ctx.set({ headers });
      updateHeaders(headers);
    }
    if (!rawResponse) {
      return { csrfToken: token };
    }
  } else {
    // for csrf, preserve the existing cookies
    const existingCookie = headers.get('cookie');
    const cookieParts = [];
    if (existingCookie) {
      cookieParts.push(parseToken(headers), parseCallback(headers));
    }
    if (csrfCook) {
      cookieParts.push(csrfCook);
    } else {
      // use the one tha tis already there
      cookieParts.push(parseCSRF(headers));
    }
    const cookie = cookieParts.filter(Boolean).join('; ');

    // we need to do it in both places in case its the very first time
    headers.set('cookie', cookie);
    ctx.set({ headers });
    updateHeaders(new Headers({ cookie }));
  }
  if (rawResponse) {
    return res as T;
  }
  try {
    return (await res.clone().json()) as T;
  } catch {
    return res as T;
  }
}
