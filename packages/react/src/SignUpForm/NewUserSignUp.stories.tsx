import React from 'react';
import { Meta } from '@storybook/react';

import { NileProvider } from '../context';

import SignUpForm from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: SignUpForm,
};

export default meta;

export function Basic() {
  return (
    <NileProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <SignUpForm onSuccess={() => alert('success!')} />
      </div>
    </NileProvider>
  );
}
