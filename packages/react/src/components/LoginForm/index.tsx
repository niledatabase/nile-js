import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { Attribute } from '../../lib/SimpleForm/types';
import { useNile } from '../../context';
import UserForm, { AttributeType } from '../../lib/SimpleForm';

import { Props } from './types';

export default function LoginForm(props: Props) {
  const nile = useNile();

  const { attributes, onSuccess, onError } = props;

  const mutation = useMutation(
    (data: { email: string; password: string }) => {
      const { email, password } = data;
      return nile.users.loginUser({ loginInfo: { email, password } });
    },
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

  const completeAttributes = React.useMemo(() => {
    const mainAttributes: Attribute[] = [
      {
        name: 'email',
        label: 'Email',
        type: AttributeType.Text,
        defaultValue: '',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: AttributeType.Password,
        defaultValue: '',
        required: true,
      },
    ];
    if (attributes && attributes.length > 0) {
      return mainAttributes.concat(attributes);
    }
    return mainAttributes;
  }, [attributes]);

  return (
    <UserForm
      mutation={mutation}
      buttonText="Log in"
      attributes={completeAttributes}
    />
  );
}
