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
  auth,
  getStatus,
  broadcast,
  Listener,
  NileSession,
  NonErrorSession,
  AuthState,
} from '@niledatabase/client';

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: NileSession;
  baseUrl?: string;
  basePath?: string;
  /**
   * A time interval (in seconds) after which the session will be re-fetched.
   * If set to `0` (default), the session is not polled.
   */
  refetchInterval?: number;
  /**
   * `SessionProvider` automatically refetches the session when the user switches between windows.
   * This option activates this behaviour if set to `true` (default).
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Set to `false` to stop polling when the device has no internet access offline (determined by `navigator.onLine`)
   *
   * [`navigator.onLine` documentation](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine)
   */
  refetchWhenOffline?: false;
}
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

const subscribeToAuthorizer = (onStoreChange: () => void) => {
  const handler: Listener = () => {
    onStoreChange();
  };
  auth.addListener(handler);
  return () => auth.removeListener(handler);
};

const getAuthorizerSnapshot = () => auth.state;

function useAuthorizerState() {
  return React.useSyncExternalStore(
    subscribeToAuthorizer,
    getAuthorizerSnapshot,
    getAuthorizerSnapshot
  );
}

type UpdateSession = (
  data?: any
) => Promise<NonErrorSession | null | undefined>;

type SessionContextBase = {
  update: UpdateSession;
  state: AuthState;
};

type SessionContextRequired =
  | (SessionContextBase & {
      data: NonErrorSession;
      status: 'authenticated';
    })
  | (SessionContextBase & {
      data: null | undefined;
      status: 'loading';
    });

type SessionContextOptional =
  | (SessionContextBase & {
      data: NonErrorSession;
      status: 'authenticated';
    })
  | (SessionContextBase & {
      data: null | undefined;
      status: 'unauthenticated' | 'loading';
    });

export type SessionContextValue<R extends boolean = false> = R extends true
  ? SessionContextRequired
  : SessionContextOptional;

export const SessionContext = React.createContext?.<
  SessionContextValue | undefined
>(undefined);

export interface UseSessionOptions<R extends boolean> {
  required: R;
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void;
}
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
      state: value.state,
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
  const state = useAuthorizerState();

  if (props.basePath) auth.state.basePath = props.basePath;

  const providedSession =
    props.session && !(props.session instanceof Response)
      ? props.session
      : undefined;

  const session =
    state.session === undefined
      ? providedSession ?? null
      : state.session ?? null;

  React.useEffect(() => {
    if (props.session && !(props.session instanceof Response)) {
      auth.initialize({ baseUrl: props.baseUrl, session: props.session });
    } else {
      if (!auth.status) {
        auth.getSession({ baseUrl: props.baseUrl });
      }
    }
  }, [props.baseUrl, props.session]);

  const isOnline = useOnline();
  const shouldRefetch = refetchWhenOffline !== false || isOnline;

  const visibilityHandler = React.useCallback(() => {
    if (document.visibilityState === 'visible') {
      auth.sync('visibilitychange');
    }
  }, []);

  React.useEffect(() => {
    if (refetchInterval && shouldRefetch) {
      const refetchIntervalTimer = setInterval(() => {
        if (auth.state.session) {
          auth.state.getSession({ event: 'poll' });
        }
      }, refetchInterval * 1000);
      return () => clearInterval(refetchIntervalTimer);
    }
  }, [refetchInterval, shouldRefetch]);

  React.useEffect(() => {
    if (refetchOnWindowFocus) {
      document.addEventListener('visibilitychange', visibilityHandler, false);
    } else {
      document.removeEventListener('visibilitychange', visibilityHandler);
    }

    const unsubscribe = broadcast.receive(() => auth.sync('storage'));

    return () => {
      auth.state.lastSync = 0;
      auth.state.session = undefined;
      auth.state.getSession = () => undefined;
      unsubscribe();
      document.removeEventListener(
        'visibilitychange',
        visibilityHandler,
        false
      );
    };
  }, [refetchOnWindowFocus, visibilityHandler]);

  const status = getStatus(state.loading, session);
  const value = React.useMemo(() => {
    return {
      data: session ?? null,
      status,
      state,
      async update() {
        return await auth.refreshSession();
      },
    };
  }, [session, state, status]);
  return (
    <SessionContext.Provider value={value as any}>
      {children}
    </SessionContext.Provider>
  );
}
