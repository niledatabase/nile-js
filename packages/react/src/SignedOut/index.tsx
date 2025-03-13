'use client';
import React from 'react';
import { SessionProviderProps } from 'packages/react/lib/auth/Authorizer';

import { useSession, SessionProvider } from '../../lib/auth';
import { convertSession } from '../SignedIn';

export default function SignedOut({
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
  if (status === 'unauthenticated') {
    if (className) {
      return <div className={className}>{children}</div>;
    }
    return children;
  }
  return null;
}
