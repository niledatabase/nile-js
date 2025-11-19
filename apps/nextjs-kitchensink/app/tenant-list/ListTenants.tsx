import { ColumnDef } from '@tanstack/react-table';
import { TenantSelector, UserInfo } from '@niledatabase/react';

import { nile } from '../api/[...nile]/nile';

import { DataTable } from './table';

export default async function ListTenants() {
  const [tenants, me] = await nile.withContext(() =>
    Promise.all([nile.tenants.list(), nile.users.getSelf()])
  );
  if (tenants instanceof Response || me instanceof Response) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="max-w-3xl border border-muted rounded-xl p-10 w-fit flex flex-col gap-4">
        <UserInfo user={me} />
        <TenantSelector className="border border-muted px-4 py-6 rounded-xl" />
      </div>
      <DataTable data={tenants} columns={columns} className="w-full" />
    </div>
  );
}

type Tenant = {
  id: string;
  name: string;
};
const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
];
