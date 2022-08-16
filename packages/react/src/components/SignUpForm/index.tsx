import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { useNile } from '../../context';
import UserForm from '../../lib/UserForm';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const { onSuccess, onError } = props;

  const nile = useNile();

  const mutation = useMutation(
    (createUserRequest: { email: string; password: string }) =>
      nile.users.createUser({ createUserRequest }),
    {
      onSuccess: (_, data) => {
        onSuccess && onSuccess(data);
      },
      onError: (error) => {
        onError && onError(error as Error);
      },
    }
  );

  return <UserForm mutation={mutation} buttonText="Sign up" />;
}
