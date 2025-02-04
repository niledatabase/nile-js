import React from 'react';

import { Props } from '../types';

import FormReset from './Form';

export default function ResetPasswordForm(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-3xl">Request password reset</h2>
      <FormReset {...props} />
    </div>
  );
}
