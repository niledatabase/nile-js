import { Server, TENANT_COOKIE } from '@niledatabase/server';

export function nextJs(instance: Server) {
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
  };
}
