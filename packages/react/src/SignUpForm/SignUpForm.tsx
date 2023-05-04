import React from 'react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import UserForm from '../lib/SimpleForm';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';
import { useNileConfig } from '../context';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const { buttonText = 'Sign up', onSuccess, onError, attributes } = props;
  const { workspace, database, basePath, allowClientCookies } = useNileConfig();
  const fetchPath = `${basePath}/workspaces/${workspace}/databases/${database}/users`;

  const mutation = useMutation(
    async (data: { email: string; password: string }) => {
      const { email, password, ...metadata } = data;
      if (Object.keys(metadata).length > 0) {
        // eslint-disable-next-line no-console
        console.warn('additional metadata not supported yet.');
      }

      const res = await fetch(fetchPath, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'content-type': 'application/json',
        },
      }).catch((e) => e);

      if (res.ok === false) {
        throw new Error(res.status);
      }

      try {
        if (res) {
          return await res.json();
        }
      } catch (e) {
        return e;
      }
    },
    {
      onSuccess: (res, data) => {
        if (allowClientCookies) {
          Cookies.set('token', res.token.token, {
            'max-age': String(res.token.maxAge),
          });
        }
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
