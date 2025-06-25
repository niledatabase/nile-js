import { ExtensionState } from '../../types';
import { Server } from '../../Server';
import { Config, ExtensionCtx, ExtensionReturns } from '../../utils/Config';
import { TENANT_COOKIE } from '../../utils/constants';

export function getRequestConfig(params: unknown[]): Record<string, string> {
  if (typeof params[1] === 'object') {
    return params[1] as Record<string, string>;
  }
  return {};
}

// onHandleRequest -> onRequest -> onResponse
export function bindRunExtensions(instance: Server) {
  return async function runExtensions<T = ExtensionReturns>(
    toRun: ExtensionState,
    config: Config,
    params: unknown | unknown[],
    _init?: RequestInit & { request: Request }
  ): Promise<T> {
    const { debug } = config.logger('[EXTENSIONS]');
    const extensionConfig = getRequestConfig(
      Array.isArray(params) ? params : [null, params]
    );

    if (config.extensions) {
      for (const create of config.extensions) {
        if (typeof create !== 'function') {
          continue;
        }
        const ext = create(instance);

        if (extensionConfig.disableExtensions?.includes(ext.id)) {
          continue;
        }

        if (ext.onHandleRequest && toRun === ExtensionState.onHandleRequest) {
          const result = await ext.onHandleRequest(
            ...(Array.isArray(params) ? params : [params])
          );
          if (result != null) {
            return result as T;
          }
          continue;
        }

        const [param] = Array.isArray(params) ? params : [params];

        // need to know when to call these, they are all just blindly called all the time.

        if (ext.onRequest && toRun === ExtensionState.onRequest) {
          // in the case where we have an existing server with headers (when handlersWithContext is used)
          // we need to merge previous headers with incoming headers, preferring the server headers in the case of a context.
          const previousContext = instance.getContext();

          if (previousContext.preserveHeaders) {
            instance.setContext({ preserveHeaders: false });
          }
          if (!_init) {
            // this isn't strictly possible, since it was called from the sdk.
            // the divergence between `onRequest` and `onHandleRequest` causes this
            continue;
          }

          await ext.onRequest(_init.request);
          const updatedContext = instance.getContext();
          if (updatedContext?.headers) {
            const cookie = updatedContext.headers.get('cookie');
            if (cookie && param.headers) {
              param.headers.set(
                'cookie',
                mergeCookies(
                  previousContext.preserveHeaders
                    ? previousContext.headers?.get('cookie')
                    : null,
                  updatedContext.headers.get('cookie')
                )
              );
            }

            if (updatedContext.tenantId && param.headers) {
              param.headers.set(
                TENANT_COOKIE,
                String(updatedContext.headers.get(TENANT_COOKIE))
              );
            }
          }
          debug(`${ext.id ?? create.name} ran onRequest`);
          continue;
        }

        if (ext.onResponse && toRun === ExtensionState.onResponse) {
          const result = await ext.onResponse(param);
          if (result != null) {
            return result as T;
          }
          continue;
        }
      }
    }
    return undefined as T;
  };
}

export function buildExtensionConfig(instance: Server): ExtensionCtx {
  return {
    runExtensions: bindRunExtensions(instance),
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
