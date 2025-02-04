'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { Params, Props } from '../types';

import PasswordResetForm from './Form';

const queryClient = new QueryClient();

export default function ResetPasswordForm(params: Params) {
  const { client, ...props } = params;
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <ResetForm {...props} />
    </QueryClientProvider>
  );
}

function ResetForm(props: Omit<Props, 'client'>) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-3xl">Reset password</h2>
      <PasswordResetForm {...props} />
    </div>
  );
}
