import { ExtensionState } from '../../types';
import { Server } from '../../Server';
import { Config, ExtensionCtx, ExtensionReturns } from '../../utils/Config';
import { TENANT_COOKIE } from '../../utils/constants';

import { ctx } from './request-context';

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
    params?: unknown | unknown[],
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

        if (ext.withTenantId && toRun === ExtensionState.withTenantId) {
          ctx.set({
            tenantId: await ext.withTenantId(),
          });
        }

        if (ext.withUserId && toRun === ExtensionState.withUserId) {
          ctx.set({ userId: await ext.withUserId() });
        }

        if (ext.withContext && toRun === ExtensionState.withContext) {
          await ext.withContext(ctx);
        }

        if (ext.onHandleRequest && toRun === ExtensionState.onHandleRequest) {
          const result = await ext.onHandleRequest(
            Array.isArray(params) ? params : [params]
          );
          debug(`${ext.id ?? create.name} ran onHandleRequest`);
          if (result != null) {
            return result as T;
          }
        }

        const [param] = Array.isArray(params) ? params : [params];

        // need to know when to call these, they are all just blindly called all the time.

        if (ext.onRequest && toRun === ExtensionState.onRequest) {
          // in the case where we have an existing server with headers (when handlersWithContext is used)
          // we need to merge previous headers with incoming headers, preferring the server headers in the case of a context.
          const { ...previousContext } = ctx.get();

          if (!_init) {
            // this isn't strictly possible, since it was called from the sdk.
            // the divergence between `onRequest` and `onHandleRequest` causes this
            continue;
          }

          const previousHeaders = new Headers(previousContext.headers);
          await ext.onRequest(_init.request, ctx);
          const updatedContext = ctx.get();
          if (updatedContext?.headers) {
            const cookie = updatedContext.headers.get('cookie');
            if (cookie && param.headers) {
              const updatedCookies = mergeCookies(
                previousHeaders?.get('cookie'),
                updatedContext.headers.get('cookie')
              );
              param.headers.set('cookie', updatedCookies);
            }

            if (updatedContext.tenantId && param.headers) {
              param.headers.set(
                TENANT_COOKIE,
                String(updatedContext.headers.get(TENANT_COOKIE))
              );
            }

            ctx.set({ headers: param.headers });
          }
          debug(`${ext.id ?? create.name} ran onRequest`);
        }

        if (ext.onResponse && toRun === ExtensionState.onResponse) {
          const result = await ext.onResponse(param, ctx);

          debug(`${ext.id ?? create.name} ran onResponse`);
          if (result != null) {
            return result as T;
          }
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

//just makes typing faster
type ExtensionRunOptions = {
  skipWithContext?: boolean;
};

export async function runExtensionContext(
  config: Config,
  options?: ExtensionRunOptions
) {
  if (!options?.skipWithContext) {
    await config?.extensionCtx?.runExtensions(
      ExtensionState.withContext,
      config
    );
  }

  await config?.extensionCtx?.runExtensions(
    ExtensionState.withTenantId,
    config
  );
  await config?.extensionCtx?.runExtensions(ExtensionState.withUserId, config);
}
