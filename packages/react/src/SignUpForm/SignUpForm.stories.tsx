import React from 'react';
import { Meta } from '@storybook/react';

import SignUp from '.';

const meta: Meta = {
  title: 'Sign up form',
  component: SignUp,
};

export default meta;

export function SignUpForm() {
  return <SignUp onSuccess={() => alert('success!')} />;
}
