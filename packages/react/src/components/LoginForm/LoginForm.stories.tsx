import React from 'react';
import { Meta } from '@storybook/react';
import Stack from '@mui/joy/Stack';

import GoogleLoginButton from '../../GoogleLoginButton';
import { NileProvider } from '../../context';

import LoginForm from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: LoginForm,
};

export default meta;

export const Basic = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <Stack sx={{ maxWidth: '20rem', margin: '0 auto' }} spacing={2}>
      <LoginForm onSuccess={() => alert('success!')} />
    </Stack>
  </NileProvider>
);

export const WithSSO = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <Stack sx={{ maxWidth: '20rem', margin: '0 auto' }} spacing={2}>
      <LoginForm onSuccess={() => alert('success!')} />
      <GoogleLoginButton />
    </Stack>
  </NileProvider>
);
