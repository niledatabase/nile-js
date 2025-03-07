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

import React, { useCallback } from 'react';
import type { UseSessionOptions } from 'next-auth/react';

import { broadcast } from './broadcast';
import Authorizer, {
  FetchInit,
  GetSessionParams,
  SessionProviderProps,
} from './Authorizer';
import { getStatus } from './status';
import { NonErrorSession } from './types';

export const authorizer = new Authorizer();
export const auth = () => {
  return authorizer;
};

export const getSession = async function getSession(params?: GetSessionParams) {
  return await auth().getSession(params);
};

export const getCsrfToken = async function getCsrfToken(params?: FetchInit) {
  return auth().getCsrfToken(params);
};

export const getProviders = async function getProviders(params?: FetchInit) {
  return auth().getProviders(params);
};

export const signOut: typeof authorizer.signOut = async function signOut(
  options
) {
  return auth().signOut(options);
};
export const signIn: typeof authorizer.signIn = async function signOut(
  provider,
  options,
  authParams
) {
  return auth().signIn(provider, options, authParams);
};
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

type UpdateSession = (
  data?: any
) => Promise<NonErrorSession | null | undefined>;

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | {
          update: UpdateSession;
          data: NonErrorSession;
          status: 'authenticated';
        }
      | { update: UpdateSession; data: null | undefined; status: 'loading' }
  :
      | {
          update: UpdateSession;
          data: NonErrorSession;
          status: 'authenticated';
        }
      | {
          update: UpdateSession;
          data: null | undefined;
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
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signout)
 */

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

  const {
    children,
    refetchWhenOffline,
    refetchInterval,
    refetchOnWindowFocus,
  } = props;

  React.useEffect(() => {
    if (props.session && !(props.session instanceof Response)) {
      auth().initialize({ baseUrl: props.baseUrl, session: props.session });
    }
  });

  const isOnline = useOnline();
  const shouldRefetch = refetchWhenOffline !== false || isOnline;

  const visibilityHandler = useCallback(() => {
    if (document.visibilityState === 'visible') {
      auth().sync('visibilitychange');
    }
  }, []);

  React.useEffect(() => {
    if (refetchInterval && shouldRefetch) {
      const refetchIntervalTimer = setInterval(() => {
        if (auth().auth.session) {
          auth().auth.getSession({ event: 'poll' });
        }
      }, refetchInterval * 1000);
      return () => clearInterval(refetchIntervalTimer);
    }
  }, [refetchInterval, shouldRefetch]);

  React.useEffect(() => {
    auth().sync();

    if (refetchOnWindowFocus) {
      document.addEventListener('visibilitychange', visibilityHandler, false);
    } else {
      document.removeEventListener('visibilitychange', visibilityHandler);
    }

    const unsubscribe = broadcast.receive(() => auth().sync('storage'));

    return () => {
      auth().auth.lastSync = 0;
      auth().auth.session = undefined;
      auth().auth.getSession = () => undefined;
      unsubscribe();
      document.removeEventListener(
        'visibilitychange',
        visibilityHandler,
        false
      );
    };
  }, [refetchOnWindowFocus, visibilityHandler]);

  return (
    <SessionContext.Provider
      value={{
        data: auth().auth.session,
        // @ts-expect-error - all three but not really
        loading: getStatus(auth.auth.loading, auth.auth.session),
        async update(data) {
          return await auth().refreshSession(data);
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
