import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';

import { NileProvider } from '../context';
import defaultTheme from '../context/themeJoiner';

import GoogleLoginButton from './GoogleLoginButton';

const meta = {
  title: 'Social/Google',
  component: GoogleLoginButton,
  tags: ['autodocs'],
};

export default meta;

export function Basic() {
  return (
    <NileProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton />
      </div>
    </NileProvider>
  );
}
export function AlphaVersionWithOutProvider() {
  return (
    <CssVarsProvider theme={defaultTheme}>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton href="some href" />
      </div>
    </CssVarsProvider>
  );
}

export function AlphaVersionWithProvider() {
  return (
    <NileProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton />
      </div>
    </NileProvider>
  );
}
