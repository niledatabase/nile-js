'use client';

import { UserLoginForm } from '@theniledev/react';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import NileContext from '@/nile/ui/NileContext';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const { push } = useRouter();
  return (
    <NileContext>
      <Stack gap={2}>
        <Typography level="h1">Log in</Typography>
        {error && <Alert>{error}</Alert>}
        <UserLoginForm
          beforeMutate={(data) => {
            setError(null);
            return data;
          }}
          onSuccess={(resp) => {
            push(`/teams/${resp.slug}`);
          }}
          onError={(e, d) => {
            setError('an error occurred');
          }}
        />
        <Typography>
          Use the team principal email + password to log in. eg
          `Guenther@Steiner.com`
        </Typography>
      </Stack>
    </NileContext>
  );
}
