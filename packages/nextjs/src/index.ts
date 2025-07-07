import {
  parseResetToken,
  parseToken,
  TENANT_COOKIE,
} from '@niledatabase/server';
import type { Extension } from '@niledatabase/server';

const nextJs: Extension = (instance) => {
  return {
    id: 'next-js-cookies',
    onRequest: async () => {
      const { cookies, headers } = await import('next/headers');
      const headersHelper = await headers();
      const cooks = await cookies();
      instance.setContext(headersHelper);
      if (!instance.getContext().tenantId) {
        const tenantCookie = cooks.get(TENANT_COOKIE);
        if (tenantCookie) {
          instance.setContext({ tenantId: tenantCookie.value });
        }
      }
    },
    onResponse: async ({ response }) => {
      const resHeaders = response?.headers;
      if (resHeaders) {
        const token = parseToken(resHeaders);
        const reset = parseResetToken(resHeaders);
        const cookie = [token, reset].filter(Boolean).join('; ');
        if (cookie.length) {
          // set this to true (only works once) since the request is 100% server side until the next request
          instance.setContext({ preserveHeaders: true });
          instance.setContext(new Headers({ cookie }));
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
