/**
 * Acts as a bridge between `api.handlers` and the subsequent functions
 */
import {
  X_NILE_ORIGIN,
  X_NILE_TENANT,
  X_NILE_USER_ID,
} from '../utils/constants';

type Optional = string | undefined | null;
export type AsyncContext = {
  origin?: Optional;
  cookie?: Optional;
  tenantId?: Optional;
  userId?: Optional;
};

let globalContext: AsyncContext | null = null;

export function setContext(headers: Headers) {
  const origin = headers.get(X_NILE_ORIGIN);
  const host = headers.get('host');
  const cookie = headers.get('cookie');
  const tenantId = headers.get(X_NILE_TENANT);
  const userId = headers.get(X_NILE_USER_ID);
  const context: AsyncContext = {};
  if (origin) {
    context.origin = origin;
  } else if (host) {
    context.origin = host;
  }

  if (cookie) {
    context.cookie = cookie;
  }

  if (tenantId) {
    context.tenantId = tenantId;
  }
  if (userId) {
    context.userId = userId;
  }
  globalContext = context;
}

export function getOrigin(): Optional {
  return globalContext?.origin;
}

export function getCookie(): Optional {
  return globalContext?.cookie;
}

export function getTenantId(): Optional {
  return globalContext?.tenantId;
}
export function getUserId(): Optional {
  return globalContext?.userId;
}

// a special case where we have a `set-cookie` header
export function setCookie(headers?: Headers) {
  const getSet = headers?.getSetCookie?.();
  if (getSet?.length) {
    const updatedCookie: string[] = [];

    for (const cook of getSet) {
      const [c] = cook.split('; ');
      const [, val] = c.split('=');
      if (val) {
        updatedCookie.push(c);
      }
    }

    const cookie = mergeCookies(updatedCookie);
    globalContext = { ...globalContext, cookie };
  }
}

function mergeCookies(overrideArray: string[]): string {
  const cookieString = getCookie();
  const cookieMap: Record<string, string> = {};

  if (!cookieString) {
    return overrideArray.join('; ');
  }
  cookieString.split(';').forEach((cookie) => {
    const [rawKey, ...rawVal] = cookie.trim().split('=');
    const key = rawKey.trim();
    const value = rawVal.join('=').trim(); // in case value has `=`
    if (key) cookieMap[key] = value;
  });

  overrideArray.forEach((cookie) => {
    const [rawKey, ...rawVal] = cookie.trim().split('=');
    const key = rawKey.trim();
    const value = rawVal.join('=').trim();
    if (key) cookieMap[key] = value;
  });

  return Object.entries(cookieMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}
