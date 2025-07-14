'use client';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@niledatabase/server';
import { useMemo } from 'react';

import { DataTable } from './InviteUserTable';
import { removeUser } from './actions';

import { Button } from '@/components/ui/button';

export default function MembersTable({
  users,
  me,
}: {
  users: User[];
  me: User;
}) {
  const columns = useMemo((): ColumnDef<User>[] => {
    return [
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'created', header: 'created' },
      { accessorKey: 'name', header: 'name' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          if (row.original.id === me.id) {
            return null;
          }
          return (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => removeUser(row.original)}
              >
                Remove
              </Button>
            </div>
          );
        },
      },
    ];
  }, [me]);
  return (
    <DataTable
      columns={columns}
      data={users instanceof Response ? [] : users}
    />
  );
}
