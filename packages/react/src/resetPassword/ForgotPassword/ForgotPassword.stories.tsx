import React from 'react';
import { Meta } from '@storybook/react';

import ForgotPasswordC from '.';

const meta: Meta = {
  title: 'Forgot password',
  component: ForgotPassword,
};

export default meta;

export function ForgotPassword() {
  return <ForgotPasswordC />;
}
