import React from 'react';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Email,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Password,
} from '../../components/ui/form';

import SignUp, { useSignUp } from '.';

const meta: Meta = {
  title: 'Sign up form',
  component: SignUp,
};

export default meta;

export function SignUpForm() {
  return <SignUp onSuccess={() => alert('success!')} />;
}

function SignUpCustom() {
  const signUp = useSignUp({
    onSuccess: () => {
      // nothing to do here
    },
  });
  const form = useForm({
    defaultValues: {
      givenName: '',
      name: '',
      familyName: '',
      picture: '',
      email: '',
      password: '',
      newTenantName: '',
    },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formData) => signUp(formData))}
        className="space-y-8"
      >
        <Email />
        <Password />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>New tenant name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormDescription>The name of the user</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="familyName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Family name</FormLabel>
                <FormControl>
                  <Input placeholder="Family name" {...field} />
                </FormControl>
                <FormDescription>The family name of the user</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="givenName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Given name</FormLabel>
                <FormControl>
                  <Input placeholder="Given name" {...field} />
                </FormControl>
                <FormDescription>The given name of the user</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="picture"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Picture</FormLabel>
                <FormControl>
                  <Input placeholder="Picture" {...field} />
                </FormControl>
                <FormDescription>A picture of the user</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="newTenantName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>New tenant name</FormLabel>
                <FormControl>
                  <Input placeholder="Tenant name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the tenant for the user to join
                </FormDescription>
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
const queryClient = new QueryClient();
export function CustomSignUpForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignUpCustom />
    </QueryClientProvider>
  );
}
