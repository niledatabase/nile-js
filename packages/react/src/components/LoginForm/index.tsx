import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { LoginInfo } from '@theniledev/js';

import { useNile } from '../../context';
import UserForm from '../../lib/UserForm';

import { Props } from './types';

export default function LoginForm(props: Props) {
  const nile = useNile();
  const { onSuccess, onError } = props;
  const mutation = useMutation(
    (data: LoginInfo) => nile.users.loginUser({ loginInfo: data }),
    {
      onSuccess: (token, data) => {
        if (token) {
          nile.authToken = token?.token;
          onSuccess && onSuccess(data);
        }
      },
      onError: (error) => {
        onError && onError(error as Error);
      },
    }
  );

  return <UserForm mutation={mutation} buttonText="Log in" />;
}
