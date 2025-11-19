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
  set({ headers: headersHelper });
  const tenantCookie = cooks.get(TENANT_COOKIE);
  if (tenantCookie) {
    set({ tenantId: tenantCookie.value });
  }
}
const nextJs: Extension = () => {
  return {
    id: 'next-js-cookies',
    // be sure any server side request gets the headers automatically
    withContext: async (ctx: CTX) => {
      await nextJsHeaders(ctx);
    },
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
