import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { Attribute } from '../lib/SimpleForm/types';
import { useNileApi } from '../context';
import SimpleForm from '../lib/SimpleForm';
import { AttributeType } from '../lib/SimpleForm/types';

import { Props, LoginInfo } from './types';

export default function LoginForm(props: Props) {
  const { attributes, onSuccess, onError, beforeMutate } = props;
  const api = useNileApi();

  const mutation = useMutation(
    async (_data: LoginInfo) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;
      return await api.auth
        .login({
          loginRequest: data,
        })
        .catch((e) => onError && onError(e, data));
    },
    {
      onSuccess: (token, data) => {
        token && onSuccess && onSuccess(token, data);
      },
      onError: (error, data) => {
        onError && onError(error as Error, data);
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
