'use client';
import React from 'react';

import { cn } from '../../lib/utils';

import FormSignIn from './Form';
import { Props } from './types';

export default function SigningIn({ className, ...props }: Props) {
  return (
    <div className={cn(className, 'flex flex-col gap-4')}>
      <h2 className="font-sans text-3xl">Sign In</h2>
      <FormSignIn {...props} />
    </div>
  );
}
