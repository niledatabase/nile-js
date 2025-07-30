import { AsyncLocalStorage } from 'async_hooks';

import { Config } from '@niledatabase/server/utils/Config';

import Logger from '../../utils/Logger';
import { CTX, Context } from '../../types';

import { runExtensionContext } from './extensions';

const { warn, silly } = Logger({ debug: true })('[REQUEST CONTEXT]');
const storage = new AsyncLocalStorage<Context>();

export const defaultContext: Context = {
  headers: new Headers(),
  tenantId: undefined,
  userId: undefined,
};

let lastUsedContext: Context = defaultContext;

export const ctx: CTX = {
  run(ctx, fn) {
    const merged: Context = {
      ...defaultContext,
      ...ctx,
      headers:
        ctx.headers instanceof Headers ? ctx.headers : new Headers(ctx.headers),
    };
    lastUsedContext = merged;
    return storage.run(merged, fn);
  },

  get: () => {
    const ctx = storage.getStore();
    if (!ctx) {
      return { ...defaultContext }; // return a throwaway object
    }
    silly(`[GET] ${serializeContext(ctx)}`);
    return ctx;
  },

  /**
   * This is a mirror of Server.getContext, but only for requests. We keep only the request
   * information around, everything else is :above_my_pay_grade:
   * @param partial A partial context to override
   */
  set: (partial) => {
    const store = storage.getStore();
    if (!store) {
      // ⚠️ There's no active context to mutate. You MUST be inside a .run()
      warn('ctx.set() called outside of ctx.run(). This will not persist.');
      return;
    }

    // setting headers blows everything away. Surgically updating does not
    if (partial.headers === null) {
      store.headers = new Headers();
    } else if (partial.headers && store.headers instanceof Headers) {
      for (const [key, value] of new Headers(partial.headers).entries()) {
        if (key.toLowerCase() === 'cookie') {
          const existingCookies = parseCookieHeader(
            store.headers.get('cookie') || ''
          );
          const newCookies = parseCookieHeader(value);
          const mergedCookies = { ...existingCookies, ...newCookies };
          store.headers.set('cookie', serializeCookies(mergedCookies));
        } else {
          store.headers.set(key, value);
        }
      }
    }

    if ('tenantId' in partial) store.tenantId = partial.tenantId;
    if ('userId' in partial) store.userId = partial.userId;

    silly(`[SET] ${serializeContext(store)}`);
    lastUsedContext = { ...store };
  },
  // for convenience only
  getLastUsed: () => lastUsedContext,
};

export function withNileContext<T>(
  config: Config,
  fn: () => Promise<T>,
  name = 'unknown'
): Promise<T> {
  const initialContext = config.context;
  const existing = ctx.get();
  // Base headers from existing context
  const mergedHeaders = new Headers(existing.headers);
  // If it's a Request object, extract headers directly
  if (initialContext instanceof Request) {
    initialContext.headers.forEach((value, key) => {
      mergedHeaders.set(key, value);
    });

    const context = {
      headers: mergedHeaders,
      tenantId: existing.tenantId,
      userId: existing.userId,
    };

    silly(`${name} [INITIAL - Request] ${serializeContext(context)}`);
    return ctx.run(context, fn);
  }

  // Handle merging for Partial<Context> - I think maybe this is unused?
  if (initialContext.headers) {
    const incoming =
      initialContext.headers instanceof Headers
        ? initialContext.headers
        : new Headers(initialContext.headers as HeadersInit);
    incoming.forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  }

  const hasTenantId = 'tenantId' in initialContext;
  const hasUserId = 'userId' in initialContext;
  const context = {
    headers: mergedHeaders,
    tenantId: hasTenantId ? initialContext.tenantId : existing.tenantId,
    userId: hasUserId ? initialContext.userId : existing.userId,
  };

  silly(`${name} [INITIAL - Partial<Context>] ${serializeContext(context)}`);
  return ctx.run(context, async () => {
    // run the extension context last, its always better than us
    await runExtensionContext(config);

    return fn();
  });
}

function serializeContext(context: Context): string {
  const headers: Record<string, string> = {};
  const rawHeaders = new Headers(context.headers);
  rawHeaders.forEach((value, key) => {
    headers[key] = value;
  });

  return JSON.stringify({
    headers,
    tenantId: context.tenantId,
    userId: context.userId,
  });
}

function parseCookieHeader(header: string): Record<string, string> {
  return header
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .reduce((acc, curr) => {
      const [key, ...val] = curr.split('=');
      if (key) acc[key] = val.join('=');
      return acc;
    }, {} as Record<string, string>);
}

function serializeCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}
