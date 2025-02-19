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
}) {
  if (startSession instanceof Response) {
    return null;
  }
  const session = convertSession(startSession);
  return (
    <SessionProvider {...props} session={session}>
      <SignedOutChecker>{children}</SignedOutChecker>
    </SessionProvider>
  );
}
function SignedOutChecker({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status !== 'authenticated') {
    return children;
  }
  return null;
}
