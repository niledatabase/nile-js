import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';

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

export function AlphaVersionWithOutProvider() {
  return (
    <CssVarsProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <GoogleLoginButton />
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
