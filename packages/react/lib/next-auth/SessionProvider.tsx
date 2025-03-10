import { Session } from 'next-auth';
import { now } from 'next-auth/client/_utils';
import { SessionContextValue, SessionProviderProps } from 'next-auth/react';

import { __NEXTAUTH } from './process';
import { getSession } from './session';
import { broadcast } from './broadcast';
import logger from './logger';
import { fetchData } from './fetchData';
import { getStatus } from './status';
import { getCsrfToken } from './getCsrfToken';

export const sessionData: {
  session: Session | null;
  loading: boolean;
  isOnline: boolean;
} = {
  session: null,
  loading: true,
  isOnline: navigator.onLine,
};

export async function initializeSession({
  session,
  refetchInterval,
  refetchWhenOffline,
  refetchOnWindowFocus = true,
  baseUrl,
  basePath,
}: SessionProviderProps) {
  if (basePath) __NEXTAUTH.basePath = basePath;
  if (baseUrl) __NEXTAUTH.baseUrl = baseUrl;

  const hasInitialSession = session !== undefined;
  if (session) {
    sessionData.session = session;
  }
  sessionData.loading = !hasInitialSession;
  __NEXTAUTH._lastSync = hasInitialSession ? now() : 0;
  __NEXTAUTH._session = session;

  await fetchAndSyncSession();

  if (refetchInterval && shouldRefetch(refetchWhenOffline)) {
    const refetchIntervalTimer = setInterval(() => {
      if (__NEXTAUTH._session) {
        fetchAndSyncSession('poll');
      }
    }, refetchInterval * 1000);

    __NEXTAUTH._refetchIntervalTimer = refetchIntervalTimer;
  }

  if (refetchOnWindowFocus) {
    document.addEventListener('visibilitychange', visibilityHandler, false);
  }
}

export async function fetchAndSyncSession(
  event?: 'storage' | 'timer' | 'hidden' | 'poll' | 'visibilitychange'
) {
  try {
    const storageEvent = event === 'storage';
    if (storageEvent || __NEXTAUTH._session === undefined) {
      __NEXTAUTH._lastSync = now();
      __NEXTAUTH._session = await getSession({ broadcast: !storageEvent });
      sessionData.session = __NEXTAUTH._session;
      return;
    }
    if (
      !event ||
      __NEXTAUTH._session === null ||
      now() < __NEXTAUTH._lastSync
    ) {
      return;
    }
    __NEXTAUTH._lastSync = Date.now();
    __NEXTAUTH._session = await getSession();
    sessionData.session = __NEXTAUTH._session;
  } catch (error) {
    logger.error('CLIENT_SESSION_ERROR', error as Error);
  } finally {
    sessionData.loading = false;
  }
}

export function getContext<R extends boolean>(): SessionContextValue<R> {
  return {
    data: sessionData.session,
    // technically all three, but type doesn't like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: getStatus(sessionData.loading, sessionData.session) as any,
    async update(data) {
      if (sessionData.loading || !sessionData.session) return;
      sessionData.loading = true;
      const newSession = await fetchData('session', __NEXTAUTH, logger, {
        req: { body: { csrfToken: await getCsrfToken(), data } },
      });
      sessionData.loading = false;
      if (newSession) {
        __NEXTAUTH._session = newSession;
        sessionData.session = newSession;
        broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
      }
      return newSession;
    },
  };
}

export function visibilityHandler() {
  if (document.visibilityState === 'visible') {
    fetchAndSyncSession('visibilitychange');
  }
}

export function shouldRefetch(refetchWhenOffline?: boolean) {
  return refetchWhenOffline !== false || navigator.onLine;
}
