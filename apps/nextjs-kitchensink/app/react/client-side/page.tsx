'use client';

import { SessionProvider, UserInfo, useSession } from '@niledatabase/react';

export default function ClientSideReact() {
  return (
    <SessionProvider>
      <div className="flex gap-4 container mx-auto flex-col max-w-5xl">
        <UserInfo />
        <SessionDebugger />
      </div>
    </SessionProvider>
  );
}

function SessionDebugger() {
  const session = useSession();
  return (
    <div>
      <code>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </code>
    </div>
  );
}
