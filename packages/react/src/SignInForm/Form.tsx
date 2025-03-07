'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/button';
import { Email, Form, Password } from '../../components/ui/form';

import { useSignIn } from './hooks';
import { Props } from './types';

const queryClient = new QueryClient();

export default function SigningIn(props: Props) {
  const { client, ...remaining } = props ?? {};
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <SignInForm {...remaining} />
    </QueryClientProvider>
  );
}

export function SignInForm(props: Props) {
  const signIn = useSignIn(props);
  const form = useForm({ defaultValues: { email: '', password: '' } });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          ({ email, password }) => signIn && signIn({ email, password })
        )}
        className="space-y-8"
      >
        <Email />
        <Password />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
