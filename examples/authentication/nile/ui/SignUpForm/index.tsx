'use client';

import { UserSignupForm } from '@theniledev/react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';

import NileContext from '@/nile/ui/NileContext';

export default function SignUp() {
  return (
    <NileContext>
      <Stack gap={2} sx={{ maxWidth: '40ch' }}>
        <Typography level="h1">Sign up</Typography>
        <UserSignupForm
          onSuccess={() => {
            alert(
              'sign up successful, check the network dev tools for the payload.'
            );
          }}
        />
        <p>
          Already a user? <Link href="/">Log in here</Link>
        </p>
      </Stack>
    </NileContext>
  );
}
