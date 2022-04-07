import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNile } from '@theniledev/react';
import { Invite, User } from '@theniledev/js';

function SignIn() {
    const nile = useNile();
    const [users, setUsers] = useState<Array<User>>();
    const [invites, setInvites] = useState<Array<Invite>>();
    const [joinCode, setJoinCode] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        async function listUsers() {
            const fetchedUsers = await nile.listUsers();
            if (fetchedUsers) {
                setUsers(fetchedUsers);
            }
        }
        async function getInvites() {
            setInvites(await nile.listInvites());
        }
        listUsers();
        getInvites();
    }, [nile])

    const handleLogout = useCallback(() => {
        nile.authToken = '';
        router.push('/signin');
    }, [nile, router]);

    const submitInvite = useCallback(async () => {
        await nile.acceptInvite(Number(joinCode));
    }, [joinCode, nile])
    return (
        <>
            <h1>🤩 InstaExpense 🤩</h1>
            <h2>Sign in</h2>
            {users && users.map((user) => {
                return <pre key={user.id}>{JSON.stringify(user, null, 2)}</pre>
            })}
            <button onClick={handleLogout}>Logout</button>
            <input type="text" placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}/>
            <button onClick={submitInvite}>Submit invite</button>
            {invites?.map(({inviter, status, code}, idx)=> {
                return <div key={idx}>{`Invite ${inviter} status ${status} code ${code}`}</div>
            })}
        </>
    );
}

export default SignIn;
