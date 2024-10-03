'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';

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
                <FormDescription>The email of a user.</FormDescription>
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
                <FormDescription>The desired password.</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
