import { User } from '@niledatabase/server';

import { nile } from '../api/[...nile]/nile';

import EnsureSignedIn from './EnsureSignedIn';
import TenantsAndTables from './TenantsAndTables';

export default async function InvitesIndex() {
  const me = await nile.users.getSelf();

  return (
    <EnsureSignedIn me={me}>
      <TenantsAndTables me={me as unknown as User} />
    </EnsureSignedIn>
  );
}
