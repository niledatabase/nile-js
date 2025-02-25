'use client';
import React from 'react';
import { SessionProviderProps } from 'next-auth/react';
import { Session as NextAuthSession } from 'next-auth/core/types';

import {
  useSession,
  SessionProvider,
  NileSession,
  NonErrorSession,
} from '../../lib/next-auth';

export function convertSession(
  startSession: NonErrorSession
): NextAuthSession | undefined | null {
  if (startSession && 'exp' in startSession) {
    return {
      ...startSession,
      expires: new Date(startSession.exp * 1000).toISOString(),
    };
  }

  return startSession;
}

export default function SignedIn({
  children,
  session: startSession,
  ...props
}: Omit<SessionProviderProps, 'session'> & {
  session?: NileSession;
  className?: string;
}) {
  if (startSession instanceof Response) {
    return null;
  }
  const session = convertSession(startSession);
  return (
    <SessionProvider {...props} session={session}>
      <SignedInChecker className={props.className}>{children}</SignedInChecker>
    </SessionProvider>
  );
}

function SignedInChecker({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === 'authenticated') {
    if (className) {
      return <div className={className}>{children}</div>;
    }
    return children;
  }
  return null;
}
