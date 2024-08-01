import React from 'react';
import { Meta } from '@storybook/react';
import Stack from '@mui/joy/Stack';

import theme from '../../.storybook/themeConfig';
import { NileProvider } from '../context';

import LoginForm from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: LoginForm,
};

export default meta;

export function Basic() {
  return (
    <NileProvider {...theme}>
      <Stack
        sx={{ maxWidth: '20rem', margin: '0 auto' }}
        spacing={2}
        data-joy-color-scheme="dark"
      >
        <LoginForm onSuccess={() => alert('success!')} />
      </Stack>
    </NileProvider>
  );
}
