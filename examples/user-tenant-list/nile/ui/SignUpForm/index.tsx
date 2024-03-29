'use client';

import { UserSignupForm } from '@niledatabase/react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import NileContext from '@/nile/ui/NileContext';

export default function SignUp() {
  const { push } = useRouter();
  const [error, setError] = useState('');
  return (
    <NileContext>
      <Stack gap={2} sx={{ maxWidth: '40ch' }}>
        <Typography level="h1">Sign up and Log In</Typography>
        {error && <Alert>{error}</Alert>}
        <UserSignupForm
          beforeMutate={() => {
            setError('');
          }}
          onSuccess={(resp) => {
            if (resp.tenantId) {
              push(`/${resp.tenantId}/users`);
            }
          }}
          onError={(e) => {
            setError(e.message);
          }}
        />
      </Stack>
    </NileContext>
  );
}
