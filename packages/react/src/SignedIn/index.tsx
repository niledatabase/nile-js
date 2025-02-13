'use client';
import React from 'react';
import { SessionProviderProps } from 'next-auth/react';

import { useSession, SessionProvider } from '../../lib/next-auth';

export default function SignedIn({ children, ...props }: SessionProviderProps) {
  return (
    <SessionProvider {...props}>
      <SignedInChecker>{children}</SignedInChecker>
    </SessionProvider>
  );
}

function SignedInChecker({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status === 'authenticated') {
    return children;
  }
  return null;
}
