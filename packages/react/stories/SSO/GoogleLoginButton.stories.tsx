import React from 'react';
import { Story } from '@storybook/react';

import GoogleLoginButton from '../../src/GoogleLoginButton';
import { NileProvider } from '../../src/context';

const meta = {
  component: GoogleLoginButton,
};

export default meta;

const Template: Story = () => (
  <NileProvider basePath="http://localhost:8080" workspace="my_workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <GoogleLoginButton />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
