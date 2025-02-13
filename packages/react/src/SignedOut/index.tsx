'use client';
import React from 'react';
import { SessionProviderProps } from 'next-auth/react';

import { useSession, SessionProvider } from '../../lib/next-auth';

export default function SignedOut({
  children,
  ...props
}: SessionProviderProps) {
  return (
    <SessionProvider {...props}>
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
