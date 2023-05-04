import React from 'react';
import { Story } from '@storybook/react';
import GoogleLoginButton from '@theniledev/react/GoogleLoginButton';
import { NileProvider } from '@theniledev/react/context';

const meta = {
  component: GoogleLoginButton,
};

export default meta;

const Template: Story = () => (
  <NileProvider database="database" workspace="my_workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <GoogleLoginButton />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
