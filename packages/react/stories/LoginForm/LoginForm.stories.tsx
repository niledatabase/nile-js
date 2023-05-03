import React from 'react';
import { Meta, Story } from '@storybook/react';
import Stack from '@mui/joy/Stack';

import LoginForm from '../../src/components/LoginForm';
import GoogleLoginButton from '../../src/GoogleLoginButton';
import { NileProvider } from '../../src/context';

const meta: Meta = {
  component: LoginForm,
};

export default meta;

const Template: Story<null> = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <Stack sx={{ maxWidth: '20rem', margin: '0 auto' }} spacing={2}>
      <LoginForm onSuccess={() => alert('success!')} />
    </Stack>
  </NileProvider>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

const SSO: Story<null> = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <Stack sx={{ maxWidth: '20rem', margin: '0 auto' }} spacing={2}>
      <LoginForm onSuccess={() => alert('success!')} />
      <GoogleLoginButton />
    </Stack>
  </NileProvider>
);

export const SignInWithGoogle = SSO.bind({});
