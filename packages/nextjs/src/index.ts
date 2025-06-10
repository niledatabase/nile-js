import { Server, TENANT_COOKIE } from '@niledatabase/server';

export function nextJs(instance: Server) {
  return {
    onRequest: async () => {
      const { cookies, headers } = await import('next/headers');
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
