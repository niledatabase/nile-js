import React from 'react';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';

import { Attribute } from '../lib/SimpleForm/types';
import { useApi } from '../context';
import SimpleForm from '../lib/SimpleForm';
import { AttributeType } from '../lib/SimpleForm/types';

import { Props, LoginInfo } from './types';

export default function LoginForm(props: Props) {
  const [error, setError] = React.useState<string | void>();
  const { attributes, onSuccess, onError, beforeMutate } = props;
  const api = useApi();

  const mutation = useMutation(
    async (_data: LoginInfo) => {
      setError(undefined);
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;
      return await api.auth.login({
        loginRequest: data,
      });
    },
    {
      onSuccess,
      onError,
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
    <Stack gap={2}>
      {error ? <Alert color="danger">{error}</Alert> : null}
      <SimpleForm
        mutation={mutation}
        buttonText="Log in"
        attributes={completeAttributes}
      />
    </Stack>
  );
}
