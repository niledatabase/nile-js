'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';

import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
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
} from '../../../components/ui/form';
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
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      ...defaultValues,
    },
  });
  const resetPassword = useResetPassword(params);
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    form.clearErrors();
    if (!password || !confirmPassword) {
      setDisabled(true);
    } else if (confirmPassword && password !== confirmPassword) {
      if (password !== confirmPassword) {
        form.setError('confirmPassword', {
          message: 'Passwords must match.',
        });
        if (!disabled) {
          setDisabled(true);
        }
      }
    } else {
      setDisabled(false);
    }
  }, [password, confirmPassword, disabled, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ email, password }) => {
          resetPassword({ email, password });
        })}
        className="py-2"
      >
        <Email />
        <Password />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Password"
                    {...field}
                    type="password"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormDescription>An updated password</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button
          type="submit"
          disabled={Object.keys(form.formState.errors).length > 0 || disabled}
        >
          Update password
        </Button>
      </form>
    </Form>
  );
}
