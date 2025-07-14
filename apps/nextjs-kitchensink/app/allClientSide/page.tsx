'use client';
import { signIn, getSession } from '@niledatabase/client';

import { Button } from '@/components/ui/button';

export default function AllClient() {
  const session = getSession();
  return (
    <div>
      Session data: {session ? JSON.stringify(session) : null}
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
