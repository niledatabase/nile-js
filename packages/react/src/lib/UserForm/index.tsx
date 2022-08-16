import React from 'react';
import TextField from '@mui/joy/TextField';
import Button from '@mui/joy/Button';
import { useForm } from 'react-hook-form';
import { LoginInfo } from '@theniledev/js';
import Stack from '@mui/joy/Stack';

export default function LoginForm(props: {
  buttonText: string;
  mutation: { mutate: (data: LoginInfo) => void };
}) {
  const { mutation, buttonText } = props;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = React.useCallback(
    (data: LoginInfo) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit((data) => onSubmit(data as LoginInfo))}
      spacing={2}
    >
      <TextField
        label="Email"
        placeholder="Email"
        error={Boolean(errors.Email)}
        helperText={errors.Email && 'This field is required'}
        {...register('Email', { required: true })}
      />

      <TextField
        label="Password"
        placeholder="Password"
        type="password"
        error={Boolean(errors.Password)}
        helperText={errors.Password && 'This field is required'}
        {...register('Password', { required: true })}
      />

      <Button type="submit">{buttonText}</Button>
    </Stack>
  );
}
