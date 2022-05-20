import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { Invite, Organization } from '@theniledev/js';
import { useNile } from '@theniledev/react';
import { useQuery } from 'react-query';

import { UserTable } from '../components/UserTable';

const useOrgQuery = () => {
  const nile = useNile();
  const { isLoading: userLoading, data: user } = useQuery('me', () =>
    nile.users.me()
  );

  const { isLoading: orgLoading, data: orgs } = useQuery('organizations', () =>
    nile.organizations.listOrganizations()
  );
  const currentUserEmail = user?.email;

  const orgId = React.useMemo(() => {
    const org = orgs?.filter(
      (org: Organization) => org.name === currentUserEmail
    );
    const [{ id }] = org ?? [{}];
    return id;
  }, [currentUserEmail, orgs]);
  return [userLoading || orgLoading, orgId];
};

function SignIn() {
  const nile = useNile();
  const [joinCode, setJoinCode] = useState<string>('');
  const router = useRouter();
  const [loadingOrgId, orgId] = useOrgQuery();

  const { isLoading: invitesLoading, data: invites = [] } = useQuery(
    'invites',
    () => nile.organizations.listInvites({ org: Number(orgId) }),
    { enabled: !!orgId }
  );

  const handleLogout = useCallback(() => {
    nile.authToken = '';
    router.push('/signin');
  }, [nile, router]);

  const submitInvite = useCallback(async () => {
    await nile.organizations.acceptInvite({
      code: Number(joinCode),
      org: Number(orgId),
    });
  }, [joinCode, nile, orgId]);

  const isLoading = loadingOrgId || invitesLoading;

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
