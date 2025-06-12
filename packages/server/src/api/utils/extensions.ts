import { Server } from '../../Server';
import { Config } from '../../utils/Config';
import { TENANT_COOKIE } from '../../utils/constants';

export function bindHandleOnRequest(instance: Server) {
  return async function handleOnRequest(
    config: Config,
    _init: RequestInit & { request: Request },
    params: RequestInit
  ) {
    const { debug } = config.logger('[EXTENSIONS]');
    if (config.extensions) {
      for (const create of config.extensions) {
        if (typeof create !== 'function') {
          return undefined;
        }
        const ext = await create(instance);
        if (ext.onRequest) {
          // in the case where we have an existing server with headers (when handlersWithContext is used)
          // we need to merge previous headers with incoming headers, preferring the server headers in the case of a context.
          const previousContext = instance.getContext();

          if (previousContext.preserveHeaders) {
            instance.setContext({ preserveHeaders: false });
          }

          await ext.onRequest(_init.request);
          const updatedContext = instance.getContext();
          if (updatedContext?.headers) {
            const cookie = updatedContext.headers.get('cookie');
            if (cookie) {
              (params.headers as Headers).set(
                'cookie',
                mergeCookies(
                  previousContext.preserveHeaders
                    ? previousContext.headers?.get('cookie')
                    : null,
                  updatedContext.headers.get('cookie')
                )
              );
            }

            if (updatedContext.tenantId) {
              (params.headers as Headers).set(
                TENANT_COOKIE,
                String(updatedContext.headers.get(TENANT_COOKIE))
              );
            }
          }
          debug(`${ext.id ?? create.name} ran onRequest`);
        }
      }
    }
  };
}

export function buildExtensionConfig(instance: Server) {
  return {
    handleOnRequest: bindHandleOnRequest(instance),
  };
}
function mergeCookies(...cookieStrings: (string | null | undefined)[]) {
  const cookieMap = new Map<string, string>();
  for (const str of cookieStrings) {
    if (!str) continue;
    for (const part of str.split(';')) {
      const [key, value] = part.split('=').map((s) => s.trim());
      if (key && value) cookieMap.set(key, value);
    }
  }
  return [...cookieMap.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}
