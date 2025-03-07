import React from 'react';

import { cn } from '../../lib/utils';

import { Props } from './types';
import SignUpForm from './Form';

export default function SigningUp({ className, ...props }: Props) {
  return (
    <div className={cn(className, 'flex flex-col gap-4')}>
      <div className="font-sans text-3xl">Sign up</div>
      <SignUpForm {...props} />
    </div>
  );
}
