import { parseTenantId, User } from '@niledatabase/server';
import { TenantSelector, UserInfo } from '@niledatabase/react';
import { headers } from 'next/headers';

import { nile } from '../api/[...nile]/nile';

import { InviteUserToTenant } from './InviteUserToTenant';
import InvitesTable from './InvitesTable';
import MembersTable from './MembersTable';
import { inviteUser, setActiveTenant } from './actions';

export default async function TenantsAndTables({ me }: { me: User }) {
  // Getting the tenant id from the cookie is handled automatically,
  // but we want a nice fallback if it does not exist, so we are going to
  // manually set it so we don't have flicker.
  const tenantId = parseTenantId(await headers());

  // override or exclude something that is missing from the cookies.
  // Eg we are making this depending on the API, not client state
  // it is way easier to just not do this and handle everything with a cookie
  // but there are other use cases.
  const config = {
    userId: me.id,
    tenantId: tenantId ?? me.tenants[0],
    preserveHeaders: true,
  };
  const [invites, users, tenants] = await nile.withContext(
    config,
    async (_nile) => {
      return Promise.all([
        _nile.tenants.invites(),
        _nile.tenants.users(),
        _nile.tenants.list(),
      ]);
    }
  );

  return (
    <div className="w-2xl mx-auto p-10 flex flex-col gap-10">
      <UserInfo user={me} />
      <div className="flex flex-col gap-8">
        <div className="text-5xl font-bold">
          <TenantSelector
            tenants={tenants instanceof Response ? [] : tenants}
            activeTenant={tenantId}
            onTenantChange={setActiveTenant}
          />
        </div>
        <div>
          <div className="text-2xl font-bold">Pending invites</div>
          <InviteUserToTenant action={inviteUser} />
          <InvitesTable invites={invites instanceof Response ? [] : invites} />
        </div>
        <div>
          <div className="text-2xl font-bold">Org members</div>
          <MembersTable
            users={users instanceof Response ? [] : users}
            me={me}
          />
        </div>
      </div>
    </div>
  );
}
