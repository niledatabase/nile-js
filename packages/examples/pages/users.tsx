import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useNile, useNileFetch } from '@theniledev/react';
import { Invite, User } from '@theniledev/js';

function SignIn() {
  const nile = useNile();
  const [joinCode, setJoinCode] = useState<string>('');
  const router = useRouter();

  const [isLoading, [users, invites]] = useNileFetch<[User[], Invite[]]>(() => [
    nile.listUsers({}),
    nile.listInvites({}),
  ]);

  const handleLogout = useCallback(() => {
    nile.authToken = '';
    router.push('/signin');
  }, [nile, router]);

  const submitInvite = useCallback(async () => {
    await nile.acceptInvite({ code: Number(joinCode) });
  }, [joinCode, nile]);

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign in</h2>
      {users &&
        users.map((user) => {
          return <pre key={user.id}>{JSON.stringify(user, null, 2)}</pre>;
        })}
      <button onClick={handleLogout}>Logout</button>
      <input
        type="text"
        placeholder="Invite code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
      />
      <button onClick={submitInvite}>Submit invite</button>
      {invites?.map(({ inviter, status, code }, idx) => {
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
