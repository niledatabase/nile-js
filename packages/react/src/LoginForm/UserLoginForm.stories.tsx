import React from 'react';
import { Meta } from '@storybook/react';
import Stack from '@mui/joy/Stack';

import LoginForm from '../../src/LoginForm';
import { NileProvider } from '../../src/context';

const meta: Meta = {
  tags: ['autodocs'],
  component: LoginForm,
};

export default meta;

export function Basic() {
  return (
    <NileProvider>
      <Stack sx={{ maxWidth: '20rem', margin: '0 auto' }} spacing={2}>
        <LoginForm onSuccess={() => alert('success!')} />
      </Stack>
    </NileProvider>
  );
}
