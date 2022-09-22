import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { useNile } from '../../context';
import UserForm from '../../lib/SimpleForm';
import { Attribute, AttributeType } from '../../lib/SimpleForm/types';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const nile = useNile();

  const { onSuccess, onError, attributes } = props;

  const mutation = useMutation(
    (data: { email: string; password: string }) => {
      const { email, password, ...metadata } = data;
      return nile.users.createUser({
        createUserRequest: { email, password, metadata },
      });
    },
    {
      onSuccess: (_, data) => {
        onSuccess && onSuccess(data);
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
      buttonText="Sign up"
      attributes={completeAttributes}
    />
  );
}
