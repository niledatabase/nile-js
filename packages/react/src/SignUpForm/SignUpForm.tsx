import React from 'react';
import { useMutation } from '@tanstack/react-query';

import UserForm from '../lib/SimpleForm';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';
import { useApi } from '../context';

import { Props, LoginInfo } from './types';

export default function SignUpForm(props: Props) {
  const {
    buttonText = 'Sign up',
    onSuccess,
    onError,
    attributes,
    beforeMutate,
  } = props;
  const api = useApi();
  const mutation = useMutation(
    async (_data: LoginInfo) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;
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
      onSuccess: (data, formValues) => {
        data && onSuccess && onSuccess(data, formValues);
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
