import React from 'react';
import { useMutation } from '@tanstack/react-query';

import UserForm from '../lib/SimpleForm';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';
import { useNileApi } from '../context';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const { buttonText = 'Sign up', onSuccess, onError, attributes } = props;
  const api = useNileApi();
  const mutation = useMutation(
    async (data: { email: string; password: string }) => {
      const { email, password, ...metadata } = data;
      if (Object.keys(metadata).length > 0) {
        // eslint-disable-next-line no-console
        console.warn('additional metadata not supported yet.');
      }
      return api.auth
        .signUp({
          signUpRequest: { email, password },
        })
        .catch((e) => {
          onError && onError(e, data);
        });
    },
    {
      onSuccess: (res, data) => {
        onSuccess && onSuccess(data);
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
    <UserForm
      mutation={mutation}
      buttonText={buttonText}
      attributes={completeAttributes}
    />
  );
}
