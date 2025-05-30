'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import React from 'react';

import { Button } from '../../../components/ui/button';
import { Email, Form } from '../../../components/ui/form';
import { useResetPassword } from '../hooks';
import { Props } from '../types';

const queryClient = new QueryClient();
export default function ResetPasswordForm(props: Props) {
  return (
    <QueryClientProvider client={props.client ?? queryClient}>
      <ResetForm {...props} />
    </QueryClientProvider>
  );
}

function ResetForm(props: Props) {
  const { defaultValues, ...params } = props;
  const form = useForm({ defaultValues: { email: '', ...defaultValues } });
  const resetPassword = useResetPassword({ ...params, redirect: true });
  return (
    <Form {...form}>
      <form
        className="py-2"
        onSubmit={form.handleSubmit(({ email }) => {
          resetPassword({ email });
        })}
      >
        <Email />
        <Button type="submit">Reset password</Button>
      </form>
    </Form>
  );
}
