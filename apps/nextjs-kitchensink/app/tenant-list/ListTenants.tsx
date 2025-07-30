import { ColumnDef } from '@tanstack/react-table';
import { UserInfo } from '@niledatabase/react';

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
    <div className="flex flex-col gap-4">
      <UserInfo user={me} />
      <DataTable data={tenants} columns={columns} />
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
