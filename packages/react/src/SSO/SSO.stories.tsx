import React from 'react';
import Typography from '@mui/joy/Typography';
import { Meta } from '@storybook/react';

import { NileProvider } from '../context';
import theme from '../../.storybook/themeConfig';

import BaseSSOForm, { Okta } from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: BaseSSOForm,
};

export default meta;

export function BasicSSO() {
  return (
    <NileProvider {...theme}>
      <div
        style={{ maxWidth: '20rem', margin: '0 auto' }}
        data-joy-color-scheme="dark"
      >
        <Typography>Some kind of cool explaination</Typography>
        <BaseSSOForm
          configurationGuide={
            <Typography>Some kind of cool explaination</Typography>
          }
          providerName="placeholder"
          onSuccess={() => alert('success!')}
        />
      </div>
    </NileProvider>
  );
}
export function OktaSSO() {
  return (
    <NileProvider {...theme}>
      <div
        style={{ maxWidth: '20rem', margin: '0 auto' }}
        data-joy-color-scheme="dark"
      >
        <Okta
          onSuccess={() => {
            alert('success!');
          }}
        />
      </div>
    </NileProvider>
  );
}
