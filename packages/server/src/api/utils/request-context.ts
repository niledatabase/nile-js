import { AsyncLocalStorage } from 'async_hooks';

import { Config } from '@niledatabase/server/utils/Config';

import Logger from '../../utils/Logger';
import { CTX, Context, ExtensionState } from '../../types';

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

export async function withNileContext<T>(
  config: Config,
  fn: () => Promise<T>,
  name = 'unknown'
): Promise<T> {
  const initialContext = config.context;
  const existing = ctx.get();
  const { overrides: extensionOverrides, ran: extensionRan } =
    await resolveExtensionOverrides(config, existing);

  let mergedHeaders = new Headers(existing.headers);
  let tenantId = existing.tenantId;
  let userId = existing.userId;

  if (initialContext instanceof Request) {
    initialContext.headers.forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  } else {
    if (initialContext.headers === null) {
      mergedHeaders = new Headers();
    } else if (initialContext.headers) {
      const incoming =
        initialContext.headers instanceof Headers
          ? initialContext.headers
          : new Headers(initialContext.headers as HeadersInit);
      incoming.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }

    if ('tenantId' in initialContext) {
      tenantId = initialContext.tenantId;
    }
    if ('userId' in initialContext) {
      userId = initialContext.userId;
    }
  }

  if (extensionOverrides?.headers) {
    for (const key of extensionOverrides.headers.removed) {
      mergedHeaders.delete(key);
    }
    for (const [key, value] of extensionOverrides.headers.set) {
      mergedHeaders.set(key, value);
    }
  }

  if (extensionOverrides?.tenantId) {
    tenantId = extensionOverrides.tenantId.value;
  }

  if (extensionOverrides?.userId) {
    userId = extensionOverrides.userId.value;
  }

  const context = {
    headers: mergedHeaders,
    tenantId,
    userId,
  };

  silly(`${name} [INITIAL] ${serializeContext(context)}`);
  return ctx.run(context, async () => {
    await runExtensionContext(config, { skipWithContext: extensionRan });
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

type HeaderDiff = {
  set: Array<[string, string]>;
  removed: string[];
};

type ExtensionOverrides = {
  headers?: HeaderDiff;
  tenantId?: { value: Context['tenantId'] };
  userId?: { value: Context['userId'] };
};

async function resolveExtensionOverrides(
  config: Config,
  existing: Context
): Promise<{ overrides?: ExtensionOverrides; ran: boolean }> {
  if (!config.extensions?.length || !config.extensionCtx) {
    return { ran: false };
  }

  let updated: Context | undefined;
  await ctx.run(
    {
      headers: new Headers(existing.headers),
      tenantId: existing.tenantId,
      userId: existing.userId,
    },
    async () => {
      await config.extensionCtx?.runExtensions(
        ExtensionState.withContext,
        config
      );
      updated = ctx.get();
    }
  );

  if (!updated) {
    return { ran: true };
  }

  const diff = diffContext(existing, updated);
  return { overrides: diff, ran: true };
}

function diffContext(
  before: Context,
  after: Context
): ExtensionOverrides | undefined {
  const headers = diffHeaders(before.headers, after.headers);
  const tenantChanged = before.tenantId !== after.tenantId;
  const userChanged = before.userId !== after.userId;

  if (!headers && !tenantChanged && !userChanged) {
    return undefined;
  }

  const overrides: ExtensionOverrides = {};
  if (headers) {
    overrides.headers = headers;
  }
  if (tenantChanged) {
    overrides.tenantId = { value: after.tenantId };
  }
  if (userChanged) {
    overrides.userId = { value: after.userId };
  }
  return overrides;
}

function diffHeaders(before: Headers, after: Headers): HeaderDiff | undefined {
  const beforeMap = headersToMap(before);
  const afterMap = headersToMap(after);
  const set: Array<[string, string]> = [];
  const removed: string[] = [];

  for (const [key, value] of afterMap.entries()) {
    if (beforeMap.get(key) !== value) {
      set.push([key, value]);
    }
  }

  for (const key of beforeMap.keys()) {
    if (!afterMap.has(key)) {
      removed.push(key);
    }
  }

  if (set.length === 0 && removed.length === 0) {
    return undefined;
  }

  return { set, removed };
}

function headersToMap(headers: Headers): Map<string, string> {
  const map = new Map<string, string>();
  headers.forEach((value, key) => {
    map.set(key.toLowerCase(), value);
  });
  return map;
}
