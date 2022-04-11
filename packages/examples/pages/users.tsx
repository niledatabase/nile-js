import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNile } from '@theniledev/react';
import { Invite, Organization, User } from '@theniledev/js';

import styles from '../styles/Home.module.css';

function SignIn() {
  const nile = useNile();
  const [users, setUsers] = useState<Array<User>>();
  const [myUser, setMyUser] = useState<User>();
  const [invites, setInvites] = useState<Array<Invite>>();
  const [joinCode, setJoinCode] = useState<string>('');
  const [activeOrg, setActiveOrg] = useState<number>();

  const router = useRouter();

  useEffect(() => {
    async function doFetch() {
      const [fetchedUsers, fetchedInvites] = await Promise.all([
        await nile.listUsers(),
        await nile.listInvites(),
      ]);

      if (fetchedUsers) {
        // useres from personal org
        const [user1] = fetchedUsers ?? [];
        setMyUser(user1);
      }
      setInvites(fetchedInvites);
    }
    doFetch();
  }, [nile]);

  const [myInvite] = useMemo(() => {
    return (
      (invites &&
        invites
          .filter((invite) => {
            return invite.inviter === users?.[0].id;
          })
          .reverse()) ??
      []
    );
  }, [invites, users]);

  useMemo(() => {
    setActiveOrg(myInvite?.org);
  }, [myInvite?.org]);

  useEffect(() => {
    async function doFetch() {
      const orgUsers = await nile.listUsers(activeOrg);
      if (orgUsers) {
        setUsers(orgUsers);
      }
    }
    doFetch();
  }, [activeOrg, nile]);

  const handleLogout = useCallback(() => {
    nile.authToken = '';
    router.push('/signin');
  }, [nile, router]);

  const submitInvite = useCallback(async () => {
    await nile.acceptInvite(Number(joinCode));
  }, [joinCode, nile]);

  const handleOrgChange = useCallback((org: number) => {
    setActiveOrg(org);
  }, []);
  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>🤩 InstaExpense 🤩</h1>
        </div>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <ShowInvite invite={myInvite} />
      <div className={styles.container}>
        <div className={styles.dashboard}>
          <h2>Dashboard</h2>
          <OrgSwitch handleOrgUpdate={handleOrgChange} />
        </div>
        <h3>{`Welcome, ${myUser?.email}`}</h3>
        <h3>Org users</h3>
        <table>
          <tbody>
            <tr>
              <th className={styles.tableHeader}>User id</th>
              <th>Email</th>
            </tr>
            {users &&
              users.map((user, idx) => {
                return (
                  <tr
                    className={idx % 2 === 0 ? styles.even : styles.odd}
                    key={user.id}
                  >
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <br />
        <br />
        <div className={styles.card}>
          <p>Have an invite code? Enter it here to join your friends</p>
          <br />
          <input
            type="text"
            placeholder="Invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <div>
            <button onClick={submitInvite}>Join</button>
          </div>
        </div>
      </div>
    </>
  );
}

type OrgSwitchProps = {
  handleOrgUpdate: (orgId: number) => void;
};

function OrgSwitch(props: OrgSwitchProps) {
  const { handleOrgUpdate } = props;
  const nile = useNile();
  const [orgs, setOrgs] = useState<Array<Organization>>();
  useEffect(() => {
    async function getOrgs() {
      const fetchedOrgs = await nile.listOrganizations();
      if (fetchedOrgs) {
        setOrgs(fetchedOrgs);
      }
    }
    getOrgs();
  }, [nile]);
  return (
    <select onChange={(e) => handleOrgUpdate(Number(e.target.value))}>
      {orgs?.map((org) => (
        <option key={org.id} value={org.id}>{`Organization ${org.id}`}</option>
      ))}
    </select>
  );
}

function ShowInvite(props: { invite?: Invite }) {
  const { invite } = props;
  if (!invite?.code) {
    return null;
  }
  return (
    <div className={styles.inviteLink}>
      Want to invite a friend to your workspace? Have them sign up using the
      url:{' '}
      <a
        target="_blank"
        href={`http://localhost:3000/signup?invite_code=${invite.code}`}
        rel="noreferrer"
      >
        {`http://localhost:3000/signup?invite_code=${invite.code}`}
      </a>
    </div>
  );
}
export default SignIn;
