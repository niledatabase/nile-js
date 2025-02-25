'use client';
import React from 'react';
import { SessionProviderProps } from 'next-auth/react';

import { useSession, SessionProvider, NileSession } from '../../lib/next-auth';
import { convertSession } from '../SignedIn';

export default function SignedOut({
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
      <SignedOutChecker className={props.className}>
        {children}
      </SignedOutChecker>
    </SessionProvider>
  );
}
function SignedOutChecker({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { status } = useSession();
  if (status !== 'authenticated') {
    if (className) {
      return <div className={className}>{children}</div>;
    }
    return children;
  }
  return null;
}
