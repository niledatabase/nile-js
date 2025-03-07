import React from 'react';

import { Props } from './types';
import SignUpForm from './Form';

export default function SigningUp(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-sans text-3xl">Sign up</div>
      <SignUpForm {...props} />
    </div>
  );
}
