/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// Note about signIn() and signOut() methods:
//
// On signIn() and signOut() we pass 'json: true' to request a response in JSON
// instead of HTTP as redirect URLs on other domains are not returned to
// requests made using the fetch API in the browser, and we need to ask the API
// to return the response as a JSON object (the end point still defaults to
// returning an HTTP response with a redirect for non-JavaScript clients).
//
// We use HTTP POST requests with CSRF Tokens to protect against CSRF attacks.

import React from 'react';
import {
  type SignInAuthorizationParams,
  type SignInOptions,
  type LiteralUnion,
  type SignInResponse,
} from 'next-auth/react';
import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from 'next-auth/providers/index';
import type {
  ClientSafeProvider,
  UseSessionOptions,
  SignOutParams,
  SignOutResponse,
  SessionProviderProps,
} from 'next-auth/react';
import type { Session } from 'next-auth';

import { broadcast } from './broadcast';
import { apiBaseUrl, fetchData } from './fetchData';
import { logger } from './logger';
import { __NEXTAUTH, NODE_ENV } from './process';
import {
  fetchAndSyncSession,
  getContext,
  initializeSession,
  sessionData,
  visibilityHandler,
} from './SessionProvider';
import { getCsrfToken } from './getCsrfToken';

export { getSession } from './session';
export { __NEXTAUTH, getCsrfToken };

function useOnline() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );

  const setOnline = () => setIsOnline(true);
  const setOffline = () => setIsOnline(false);

  React.useEffect(() => {
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  return isOnline;
}

type UpdateSession = (data?: any) => Promise<Session | null>;

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { update: UpdateSession; data: Session; status: 'authenticated' }
      | { update: UpdateSession; data: null; status: 'loading' }
  :
      | { update: UpdateSession; data: Session; status: 'authenticated' }
      | {
          update: UpdateSession;
          data: null;
          status: 'unauthenticated' | 'loading';
        };

export const SessionContext = React.createContext?.<
  SessionContextValue | undefined
>(undefined);

/**
 * React Hook that gives you access
 * to the logged in user's session data.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#usesession)
 */
export function useSession<R extends boolean>(
  options?: UseSessionOptions<R>
): SessionContextValue<R> {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = React.useContext(SessionContext);
  if (!value && NODE_ENV !== 'production') {
    throw new Error(
      '[next-auth]: `useSession` must be wrapped in a <SessionProvider />'
    );
  }

  const { required, onUnauthenticated } = options ?? {};

  const requiredAndNotLoading = required && value.status === 'unauthenticated';

  React.useEffect(() => {
    if (requiredAndNotLoading) {
      const url = `/api/auth/signin?${new URLSearchParams({
        error: 'SessionRequired',
        callbackUrl: window.location.href,
      })}`;
      if (onUnauthenticated) onUnauthenticated();
      else window.location.href = url;
    }
  }, [requiredAndNotLoading, onUnauthenticated]);

  if (requiredAndNotLoading) {
    return {
      data: value.data,
      update: value.update,
      status: 'loading',
    };
  }

  return value;
}

/**
 * It calls `/api/auth/providers` and returns
 * a list of the currently configured authentication providers.
 * It can be useful if you are creating a dynamic custom sign in page.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#getproviders)
 */
export async function getProviders() {
  return await fetchData<
    Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>
  >('providers', __NEXTAUTH, logger);
}

/**
 * Client-side method to initiate a signin flow
 * or send the user to the signin page listing all possible providers.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signin)
 */
export async function signIn<
  P extends RedirectableProviderType | undefined = undefined
>(
  provider?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
): Promise<
  P extends RedirectableProviderType ? SignInResponse | undefined : undefined
> {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};

  const baseUrl = apiBaseUrl(__NEXTAUTH);
  const providers = await getProviders();

  if (!providers) {
    return { error: 'No providers enabled' } as any;
  }

  if (!provider || !(provider in providers)) {
    return { error: `Provider ${provider} not enabled` } as any;
  }

  const isCredentials = providers[provider].type === 'credentials';
  const isEmail = providers[provider].type === 'email';
  const isSupportingReturn = isCredentials || isEmail;

  const signInUrl = `${baseUrl}/${
    isCredentials ? 'callback' : 'signin'
  }/${provider}`;

  const _signInUrl = `${signInUrl}${
    authorizationParams ? `?${new URLSearchParams(authorizationParams)}` : ''
  }`;

  const res = await fetch(_signInUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error
    body: new URLSearchParams({
      ...options,
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  });

  const data = await res.json();

  // TODO: Do not redirect for Credentials and Email providers by default in next major
  if (redirect || !isSupportingReturn) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#')) window.location.reload();
    return;
  }

  const error = new URL(data.url).searchParams.get('error');

  if (res.ok) {
    await __NEXTAUTH._getSession({ event: 'storage' });
  }

  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any;
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signout)
 */
export async function signOut<R extends boolean = true>(
  options?: SignOutParams<R> & { baseUrl?: string; init?: RequestInit }
): Promise<R extends true ? undefined : SignOutResponse> {
  const { callbackUrl = window.location.href, baseUrl } = options ?? {};
  if (baseUrl) {
    __NEXTAUTH.baseUrlServer = baseUrl;
    __NEXTAUTH.baseUrl = baseUrl;
  }

  const baseFetch = apiBaseUrl(__NEXTAUTH);
  const fetchOptions: RequestInit = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error
    body: new URLSearchParams({
      csrfToken: await getCsrfToken(options),
      callbackUrl,
      json: true,
    }),
  };
  const res = await fetch(`${baseFetch}/signout`, {
    ...fetchOptions,
    ...options?.init,
  });
  const data = await res.json();

  broadcast.post({ event: 'session', data: { trigger: 'signout' } });

  // in the case you are going x-origin, we don't want to trust the nile.callback-url, so we will not redirect and just refresh the page
  if (options?.init?.credentials) {
    window.location.href = callbackUrl;
    if (callbackUrl.includes('#')) window.location.reload();
    // @ts-expect-error
    return;
  }
  if (options?.redirect ?? true) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#')) window.location.reload();
    // @ts-expect-error
    return;
  }

  await __NEXTAUTH._getSession({ event: 'storage' });

  return data;
}

/**
 * Provider to wrap the app in to make session data available globally.
 * Can also be used to throttle the number of requests to the endpoint
 * `/api/auth/session`.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#sessionprovider)
 */
export function SessionProvider(props: SessionProviderProps) {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  const { children, refetchWhenOffline, refetchInterval } = props;

  initializeSession(props);

  const isOnline = useOnline();
  // TODO: Flip this behavior in next major version
  const shouldRefetch = refetchWhenOffline !== false || isOnline;

  React.useEffect(() => {
    if (refetchInterval && shouldRefetch) {
      const refetchIntervalTimer = setInterval(() => {
        if (__NEXTAUTH._session) {
          __NEXTAUTH._getSession({ event: 'poll' });
        }
      }, refetchInterval * 1000);
      return () => clearInterval(refetchIntervalTimer);
    }
  }, [refetchInterval, shouldRefetch]);

  React.useEffect(() => {
    __NEXTAUTH._getSession = fetchAndSyncSession;

    const unsubscribe = broadcast.receive(() => fetchAndSyncSession('storage'));

    return () => {
      __NEXTAUTH._lastSync = 0;
      __NEXTAUTH._session = undefined;
      sessionData.session = null;
      __NEXTAUTH._getSession = () => undefined;
      unsubscribe();
      document.removeEventListener(
        'visibilitychange',
        visibilityHandler,
        false
      );
      if (__NEXTAUTH._refetchIntervalTimer) {
        clearInterval(__NEXTAUTH._refetchIntervalTimer);
      }
    };
  }, []);

  return (
    <SessionContext.Provider value={getContext()}>
      {children}
    </SessionContext.Provider>
  );
}

export type JWT = {
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
};

type ActiveSession = {
  id: string;
  email: string;
  expires: string;
  user?: {
    id: string;
    name: string;
    image: string;
    email: string;
    emailVerified: void | Date;
  };
};

export type NonErrorSession = JWT | ActiveSession | null | undefined;
export type NileSession = Response | NonErrorSession;
