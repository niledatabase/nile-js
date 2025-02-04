import React from 'react';
import { Meta } from '@storybook/react';

import RequestResetPasswordForm from '.';

const meta: Meta = {
  title: 'Reset password form',
  component: RequestResetPasswordForm,
};

export default meta;

export function RequestResetPassword() {
  return <RequestResetPasswordForm />;
}
