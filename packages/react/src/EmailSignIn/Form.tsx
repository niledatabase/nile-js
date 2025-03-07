'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';

import { Email, Form } from '../../components/ui/form';
import { Button } from '../../components/ui/button';

import { EmailSignInInfo, Props } from './types';
import { useEmailSignIn } from './hooks';

const queryClient = new QueryClient();

export default function EmailSigningIn(props: Props) {
  const { client, ...remaining } = props ?? {};
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <EmailSignInForm {...remaining} />
    </QueryClientProvider>
  );
}
export function EmailSignInForm(props: Props & EmailSignInInfo) {
  const signIn = useEmailSignIn(props);
  const form = useForm({ defaultValues: { email: '' } });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ email }) => signIn && signIn({ email }))}
        className="space-y-8"
      >
        <Email />
        <Button type="submit" className="flex flex-row gap-2">
          <Mail />
          Sign in with email
        </Button>
      </form>
    </Form>
  );
}
