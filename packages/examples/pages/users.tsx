import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { Invite } from '@theniledev/js';
import { useNile } from '@theniledev/react';
import { useQuery } from 'react-query';

import { UserTable } from '../components/UserTable';

function SignIn() {
  const nile = useNile();
  const [joinCode, setJoinCode] = useState<string>('');
  const router = useRouter();

  const { data: invites = [] } = useQuery('invites', () =>
    nile.listInvites({})
  );

  const handleLogout = useCallback(() => {
    nile.authToken = '';
    router.push('/signin');
  }, [nile, router]);

  const submitInvite = useCallback(async () => {
    await nile.acceptInvite({ code: Number(joinCode) });
  }, [joinCode, nile]);

  const isLoading = false;
  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign in</h2>
      <UserTable />
      <button onClick={handleLogout}>Logout</button>
      <input
        type="text"
        placeholder="Invite code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
      />
      <button onClick={submitInvite}>Submit invite</button>
      {invites?.map(({ inviter, status, code }: Invite, idx: number) => {
        return (
          <div key={idx}>
            {`Invite ${inviter} status ${status} code ${code}`}
          </div>
        );
      })}
    </>
  );
}

export default SignIn;
