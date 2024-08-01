import React from 'react';
import { useMutation } from '@tanstack/react-query';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';

import UserForm from '../lib/SimpleForm';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';
import { useApi } from '../context';

import { Props, SignUpInfo } from './types';

export default function SignUpForm(props: Props) {
  const [error, setError] = React.useState<string | void>();
  const {
    buttonText = 'Sign up',
    onSuccess,
    onError,
    attributes,
    beforeMutate,
  } = props;
  const api = useApi();
  const mutation = useMutation(
    async (_data: SignUpInfo) => {
      setError(undefined);
      const possibleData = beforeMutate && beforeMutate(_data);
      const data: SignUpInfo = { ..._data, ...possibleData };
      const {
        name,
        givenName,
        familyName,
        picture,
        email,
        password,
        newTenantName,
        ...metadata
      } = data;
      if (Object.keys(metadata).length > 0) {
        // eslint-disable-next-line no-console
        console.warn('additional metadata not supported yet.');
      }
      return await api.users.createUser({
        createBasicUserRequest: {
          email,
          password,
          name,
          familyName,
          picture,
          givenName,
          newTenantName,
        },
      });
    },
    {
      onSuccess,
      onError: (e: Error, vars) => {
        setError(e.message);
        onError && onError(e as Error, vars);
      },
    }
  );

  const completeAttributes = React.useMemo(() => {
    const mainAttributes: Attribute[] = [
      {
        name: 'email',
        label: 'Email',
        type: AttributeType.Email,
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
      <UserForm
        mutation={mutation}
        buttonText={buttonText}
        attributes={completeAttributes}
      />
    </Stack>
  );
}
