'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    autoComplete="current-email"
                  />
                </FormControl>
                <FormDescription>Your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Password"
                    {...field}
                    type="password"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormDescription>Your password.</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button>Sign up</Button>
      </form>
    </Form>
  );
}
