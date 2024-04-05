import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';

import { NileProvider } from '../context';
import theme from '../../.storybook/themeConfig';

import GoogleLoginButton from './GoogleLoginButton';

const meta = {
  title: 'Social/Google',
  component: GoogleLoginButton,
  tags: ['autodocs'],
};

export default meta;

export function Basic() {
  return (
    <NileProvider {...theme}>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton />
      </div>
    </NileProvider>
  );
}

export function BasicWithTenantNameProvider() {
  const [newTenant, setNewTenant] = React.useState<string | undefined>();
  return (
    <NileProvider {...theme}>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <Stack gap={2}>
          <Stack>
            <Input
              size="sm"
              placeholder="Organization Name"
              onChange={(event) => setNewTenant(event.target.value)}
            />
          </Stack>
          <GoogleLoginButton newTenantName={newTenant} />
        </Stack>
      </div>
    </NileProvider>
  );
}

export function AlphaVersionWithOutProvider() {
  return (
    <CssVarsProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton href="some href" />
      </div>
    </CssVarsProvider>
  );
}

export function AlphaVersionWithProvider() {
  return (
    <NileProvider {...theme}>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton />
      </div>
    </NileProvider>
  );
}
