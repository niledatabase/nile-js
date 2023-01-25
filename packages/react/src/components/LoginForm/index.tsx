import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { LoginInfo } from '@theniledev/js';

import { Attribute } from '../../lib/SimpleForm/types';
import { useNile } from '../../context';
import SimpleForm from '../../lib/SimpleForm';
import { AttributeType } from '../../lib/SimpleForm/types';

import { Props, AllowedAny } from './types';

export default function LoginForm(props: Props) {
  const nile = useNile();

  const { attributes, onSuccess, onError, beforeMutate } = props;

  const handleMutate =
    typeof beforeMutate === 'function'
      ? beforeMutate
      : (data: AllowedAny): AllowedAny => data;

  const mutation = useMutation(
    (data: { email: string; password: string }) => {
      const _data = handleMutate(data);
      return nile.users.loginUser({ loginInfo: _data as LoginInfo });
    },
    {
      onSuccess: (token, data) => {
        if (token) {
          nile.authToken = token.token;
          onSuccess && onSuccess(token, data);
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
    <SimpleForm
      mutation={mutation}
      buttonText="Log in"
      attributes={completeAttributes}
    />
  );
}
