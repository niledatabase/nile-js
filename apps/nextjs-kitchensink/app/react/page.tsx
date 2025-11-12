import { SessionProvider } from '@niledatabase/react';
import Link from 'next/link';

import { nile } from '../api/[...nile]/nile';

import { Button } from '@/components/ui/button';

export default async function Providers() {
  const session = await nile.auth.getSession();

  return (
    <SessionProvider session={session}>
      <div className="mx-auto container flex flex-row items-center justify-center h-screen">
        <Button variant="link">
          <Link href="/react/standalone-hooks">stand alone hooks</Link>
        </Button>
      </div>
    </SessionProvider>
  );
}
