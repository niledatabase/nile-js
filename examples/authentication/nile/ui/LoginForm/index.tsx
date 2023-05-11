'use client';

import { UserLoginForm } from '@theniledev/react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';

import NileContext from '@/nile/ui/NileContext';

export default function Login() {
  return (
    <NileContext>
      <Stack gap={2}>
        <Typography level="h1">Log in</Typography>
        <UserLoginForm
          onSuccess={() => {
            alert('login successful, check your browser cookies for token.');
          }}
        />
        <p>
          Not a user yet? <Link href="/sign-up">Sign up here</Link>
        </p>
      </Stack>
    </NileContext>
  );
}
