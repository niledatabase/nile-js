import React from 'react';

import { Props } from '../types';
import ResetPasswordForm from '../PasswordResetRequestForm';

export default function ForgotPassowrd(props: Props) {
  return <ResetPasswordForm {...props} hideEmail />;
}
