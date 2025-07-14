'use client';

import { useForm } from 'react-hook-form';
import { useActionState } from 'react';
import { UserInfo } from '@niledatabase/react';
import '@niledatabase/react/styles.css';

import { login, LoginResponse } from './loginAction';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function CustomLoginForm() {
  const form = useForm({
    defaultValues: {
      email: 'guy@guy.com',
      password: 'guy@guy.com',
    },
  });
  const [state, formAction, pending] = useActionState<
    LoginResponse | null,
    FormData
  >(login, null);

  return (
    <div className="container mx-auto pt-40 flex gap-20 flex-col max-w-3xl">
      <h1 className="text-4xl">Sign in</h1>
      <Form {...form}>
        {state?.user ? <UserInfo user={state?.user} /> : null}
        <form action={formAction} className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <div className="text-red-500">{state?.message}</div>
            <div className="flex flex-row gap-2">
              <Button type="submit" size="lg" disabled={pending}>
                Sign in
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
