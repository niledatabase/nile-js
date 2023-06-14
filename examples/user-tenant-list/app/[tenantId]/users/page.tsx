import nile, { api } from '@/nile/Server';
import NileContext from '@/nile/ui/NileContext';
import UserList from '@/nile/ui/UserList';

import { headers } from "next/headers";

export default async function TenantUsers() {
  const res = await api.users.listTenantUsers(new Headers(headers()));
  if (res.status === 401) {
    return 'Unauthorized';
  }
  const users = await res.json();
  return (
    <NileContext tenantId={nile.tenantId}>
      <UserList data={users} />
    </NileContext>
  );
}