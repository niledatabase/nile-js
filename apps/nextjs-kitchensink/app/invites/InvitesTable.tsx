'use client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Invite } from '@niledatabase/server';
import { useState } from 'react';

import { DataTable } from './InviteUserTable';
import { deleteInvite, resend } from './actions';

import { Button } from '@/components/ui/button';

const Buttons = ({ row }: { row: Row<Invite> }) => {
  const invite = row.original;
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        disabled={loading}
        variant="outline"
        onClick={async () => {
          setLoading(true);
          await resend(invite);
          setLoading(false);
        }}
      >
        Resend
      </Button>
      <Button
        variant="destructive"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await deleteInvite(invite);
          setLoading(false);
        }}
      >
        Delete
      </Button>
    </div>
  );
};
const columns: ColumnDef<Invite>[] = [
  { accessorKey: 'identifier', header: 'Email' },
  { accessorKey: 'expires', header: 'expires' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Buttons row={row} />,
  },
];
export default function InvitesTable({ invites }: { invites: Invite[] }) {
  return (
    <DataTable
      columns={columns}
      data={invites instanceof Response ? [] : invites}
    />
  );
}
