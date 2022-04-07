import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNile } from '@theniledev/react';
import { Invite, User } from '@theniledev/js';

function SignIn() {
    const nile = useNile();
    const [users, setUsers] = useState<Array<User>>();
    const [inviteCode, setInviteCode] = useState<number>();
    const [joinCode, setJoinCode] = useState<string>('');
    const [acceptedInvites, setAcceptedInvites] = useState<Array<Invite>>();
    const router = useRouter();

    useEffect(() => {
        async function listUsers() {
            const fetchedUsers = await nile.listUsers();
            if (fetchedUsers) {
                setUsers(fetchedUsers);
            }
        }
        async function getInvites() {
            const [invite] = await nile.listInvites();
            setInviteCode(invite.code);
        }
        async function getAcceptedInvites() {
            const invites = await nile.listInvites();
            setAcceptedInvites(invites);
        }
        listUsers();
        getInvites();
        getAcceptedInvites();
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
            {inviteCode && <div>Give your code to another user so they can use your sweet, sweet workspace: {inviteCode}</div>}
            <button onClick={handleLogout}>Logout</button>
            <input type="text" placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}/>
            <button onClick={submitInvite}>Submit invite</button>
            {acceptedInvites?.map(({inviter, status}, idx)=> {
                return <div key={idx}>{`Invite ${inviter} status ${status}`}</div>
            })}
        </>
    );
}

export default SignIn;
