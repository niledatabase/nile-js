'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Email, Form, Password } from '../../components/ui/form';
import { Button } from '../../components/ui/button';

import { Props } from './types';
import { useSignUp } from './hooks';

const queryClient = new QueryClient();
export default function SignUpForm(props: Props) {
  const { client } = props ?? {};
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <SignInForm {...props} />
    </QueryClientProvider>
  );
}

export function SignInForm(props: Props) {
  const signUp = useSignUp(props);
  const form = useForm({ defaultValues: { email: '', password: '' } });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ email, password }) =>
          signUp({ email, password })
        )}
        className="space-y-8"
      >
        <Email />
        <Password />
        <Button>Sign up</Button>
      </form>
    </Form>
  );
}
