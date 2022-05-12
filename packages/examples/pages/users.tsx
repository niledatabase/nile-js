import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { Invite, User } from '@theniledev/js';
import { useNile } from '@theniledev/react';
import { useQueries } from 'react-query';

function SignIn() {
  const nile = useNile();
  const [joinCode, setJoinCode] = useState<string>('');
  const router = useRouter();

  const [{ data: users = [] }, { data: invites = [] }] = useQueries([
    { queryKey: 'users', queryFn: () => nile.listUsers({}) },
    { queryKey: 'invites', queryFn: () => nile.listInvites({}) },
  ]);

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
      {users &&
        users.map((user: User) => {
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
