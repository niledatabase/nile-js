'use client';

import { Login200Response } from '@niledatabase/browser';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { UserTenantList } from '@niledatabase/react';

type Props = {
  data: Login200Response[];
};

export default function UserList(props: Props) {
  return (
    <Stack gap={2} margin="0 auto" maxWidth="1400px">
      <Typography level="h2">User list</Typography>
      <UserTenantList data={props.data} />
    </Stack>
  );
}
