import React from 'react';
import { Meta } from '@storybook/react';

import { NileProvider } from '../context';
import theme from '../../.storybook/themeConfig';

import SignUpForm from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: SignUpForm,
};

export default meta;

export function Basic() {
  return (
    <NileProvider {...theme}>
      <div
        style={{ maxWidth: '20rem', margin: '0 auto' }}
        data-joy-color-scheme="dark"
      >
        <SignUpForm onSuccess={() => alert('success!')} />
      </div>
    </NileProvider>
  );
}
