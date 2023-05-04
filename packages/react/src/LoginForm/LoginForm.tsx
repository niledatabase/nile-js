import React from 'react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { Attribute } from '../lib/SimpleForm/types';
import { useNileConfig } from '../context';
import SimpleForm from '../lib/SimpleForm';
import { AttributeType } from '../lib/SimpleForm/types';

import { Props, AllowedAny } from './types';

export default function LoginForm(props: Props) {
  const { workspace, database, basePath, allowClientCookies } = useNileConfig();

  const { attributes, onSuccess, onError, beforeMutate } = props;
  const fetchPath = `${basePath}/workspaces/${workspace}/databases/${database}/users/login`;

  const handleMutate =
    typeof beforeMutate === 'function'
      ? beforeMutate
      : (data: AllowedAny): AllowedAny => data;

  const mutation = useMutation(
    async (data: { email: string; password: string }) => {
      const _data = handleMutate(data);
      const res = await fetch(fetchPath, {
        method: 'POST',
        body: JSON.stringify(_data),
        headers: {
          'content-type': 'application/json',
        },
      }).catch((e) => e);
      if (res.ok === false) {
        throw new Error(res.status);
      }
      try {
        return await res.json();
      } catch (e) {
        return e;
      }
    },
    {
      onSuccess: (token, data) => {
        if (token) {
          if (allowClientCookies) {
            Cookies.set('token', token.token, {
              'max-age': token.maxAge,
            });
          }

          onSuccess && onSuccess(token, data);
        }
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
