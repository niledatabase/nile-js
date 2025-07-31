'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { Props } from '../types';
import { cn } from '../../../lib/utils';

import PasswordResetForm from './Form';

const queryClient = new QueryClient();

export default function ResetPasswordForm(params: Props) {
  const { client, ...props } = params;
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <ResetForm {...props} />
    </QueryClientProvider>
  );
}

function ResetForm({ className, ...props }: Props) {
  return (
    <div className={cn(className, 'flex flex-col gap-4')}>
      <h2 className="font-sans text-3xl">Reset password</h2>
      <PasswordResetForm {...props} />
    </div>
  );
}
