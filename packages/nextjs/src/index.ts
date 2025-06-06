import { Server, TENANT_COOKIE } from '@niledatabase/server';
import { cookies, headers } from 'next/headers';

export function nextJs(instance: Server) {
  return {
    onRequest: async () => {
      instance.setContext(await headers());
      if (!instance.getContext().tenantId) {
        const cooks = await cookies();
        const tenantCookie = cooks.get(TENANT_COOKIE);
        if (tenantCookie) {
          instance.setContext({ tenantId: tenantCookie.value });
        }
      }
    },
  };
}
