'use client';

import * as React from 'react';
import { NileSession, getSession, signIn } from '@niledatabase/client';

import { Button } from '@/components/ui/button';

export default function AllClient() {
  const [session, setSession] = React.useState<NileSession | null>(null);

  React.useEffect(() => {
    let ignore = false;
    getSession()
      .then((result) => {
        if (!ignore) {
          setSession(result ?? null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setSession(null);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      Session data: {session ? JSON.stringify(session) : 'No active session'}
      <Button
        onClick={() => {
          signIn('google', { callbackUrl: '/allClientSide' });
        }}
      >
        Sign in to google
      </Button>
    </div>
  );
}
