import React from 'react';
import { Meta } from '@storybook/react';

import { NileProvider } from '../../context';

import SignUpForm from '.';

const meta: Meta = {
  component: SignUpForm,
  tags: ['autodocs'],
};

export default meta;

export const Basic = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <SignUpForm onSuccess={() => alert('success!')} />
    </div>
  </NileProvider>
);

export const CustomFields = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <SignUpForm
        onSuccess={() => alert('success!')}
        attributes={[{ name: 'firstName', label: 'First name' }]}
      />
    </div>
  </NileProvider>
);
