'use client';
import React from 'react';
import { NileSession, NonErrorSession } from 'packages/react/lib/auth/types';
import { SessionProviderProps } from 'packages/react/lib/auth/Authorizer';

import { useSession, SessionProvider } from '../../lib/auth';

export function convertSession(
  startSession: NileSession
): NonErrorSession | undefined | null {
  if (startSession && 'exp' in startSession) {
    return {
      ...startSession,
      expires: new Date(startSession.exp * 1000).toISOString(),
    };
  }

  // handled previously with `SignedIn`
  return startSession as NonErrorSession;
}

export default function SignedIn({
  children,
  session: startSession,
  ...props
}: SessionProviderProps & {
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
