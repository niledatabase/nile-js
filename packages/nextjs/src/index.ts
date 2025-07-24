import {
  parseCallback,
  parseResetToken,
  parseToken,
  TENANT_COOKIE,
} from '@niledatabase/server';
import type { Extension, CTX } from '@niledatabase/server';

async function nextJsHeaders({ set }: CTX) {
  const { cookies, headers } = await import('next/headers');
  const headersHelper = await headers();
  const cooks = await cookies();
  set({ headers: headersHelper, preserveHeaders: true });
  const tenantCookie = cooks.get(TENANT_COOKIE);
  if (tenantCookie) {
    set({ tenantId: tenantCookie.value, preserveHeaders: true });
  }
}
const nextJs: Extension = () => {
  return {
    id: 'next-js-cookies',
    // be sure any server side request gets the headers automatically
    withContext: nextJsHeaders,
    // after the response, be sure additional calls have the correct cookies
    onResponse: async ({ response }, { set: setContext }) => {
      const resHeaders = response?.headers;
      if (resHeaders) {
        const token = parseToken(resHeaders);
        const reset = parseResetToken(resHeaders);
        const callback = parseCallback(resHeaders);
        const cookie = [token, reset, callback].filter(Boolean).join('; ');
        if (cookie.length) {
          // set this to true (only works once) since the request is 100% server side until the next request
          setContext({
            preserveHeaders: true,
            headers: new Headers({ cookie }),
          });
        }
      }
    },
  };
};

export { nextJs };

export type Handlers<T = Response> = {
  GET: (req: Request) => Promise<T>;
  POST: (req: Request) => Promise<T>;
  DELETE: (req: Request) => Promise<T>;
  PUT: (req: Request) => Promise<T>;
};
