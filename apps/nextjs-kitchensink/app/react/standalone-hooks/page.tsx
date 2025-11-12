'use client';

import { useMe } from '@niledatabase/react';

export default function StandAloneHooks() {
  const me = useMe();
  return (
    <div className="mx-auto container flex flex-row items-center justify-center h-screen">
      <pre>
        <code>{me ? JSON.stringify(me) : 'You are not logged in'}</code>
      </pre>
    </div>
  );
}
