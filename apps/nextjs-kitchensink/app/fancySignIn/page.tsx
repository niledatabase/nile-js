import {
  SignOutButton,
  SignUpForm,
  SignedIn,
  SignedOut,
  TenantSelector,
  UserInfo,
} from '@niledatabase/react';
import { Tenant, User } from '@niledatabase/server';
import { NileSession } from '@niledatabase/client';

import { nile } from '../api/[...nile]/nile';

export default async function SignUpPage() {
  const [session, me, tenants] = await Promise.all([
    nile.auth.getSession<NileSession>(),
    nile.users.getSelf<User>(),
    nile.tenants.list<Tenant[]>(),
  ]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignedIn className="flex flex-col gap-4" session={session}>
        <UserInfo user={me} />
        <TenantSelector className="py-6 mb-10" tenants={tenants} />
        <SignOutButton />
      </SignedIn>
      <SignedOut session={session}>
        <SignUpForm createTenant />
      </SignedOut>
    </div>
  );
}
