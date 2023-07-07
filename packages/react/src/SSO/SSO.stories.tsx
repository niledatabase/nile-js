import React from 'react';
import { Meta } from '@storybook/react';

import { NileProvider } from '../context';

import BaseSSOForm, { Okta } from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: BaseSSOForm,
};

export default meta;

export function BasicSSO() {
  return (
    <NileProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <BaseSSOForm
          providerName="placeholder"
          onSuccess={() => alert('success!')}
        />
      </div>
    </NileProvider>
  );
}
export function OktaSSO() {
  return (
    <NileProvider>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <Okta
          onSuccess={() => {
            alert('success!');
          }}
        />
      </div>
    </NileProvider>
  );
}
