import React from 'react';
import { Meta } from '@storybook/react';

import SignIn from '.';

const meta: Meta = {
  title: 'Sign in form',
  component: SignIn,
};

export default meta;

export function SignInForm() {
  return <SignIn />;
}
