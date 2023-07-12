import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { Attribute } from '../lib/SimpleForm/types';
import { useApi } from '../context';
import SimpleForm from '../lib/SimpleForm';
import { AttributeType } from '../lib/SimpleForm/types';

import { Props, LoginInfo } from './types';

export default function SingleSignOnForm(
  props: Props & {
    nextButtonText: string;
    loginButtonText: string;
    onSuccess?: () => void;
  }
) {
  const {
    attributes,
    onSuccess,
    onError,
    beforeMutate,
    nextButtonText = 'Next',
    loginButtonText = 'Log in',
  } = props;
  const api = useApi();
  const [buttonText, setButtonText] = React.useState(nextButtonText);

  const mutation = useMutation(
    async (_data: LoginInfo) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;
      return await api.auth
        .login({
          loginRequest: { email: data.email, password: data.password },
          sso: true,
        })
        .catch((e) => onError && onError(e, data));
    },
    {
      onSuccess: (token, data) => {
        setButtonText(loginButtonText);
        if (token) {
          if (token?.redirectURI) {
            window.location.href = token.redirectURI;
          } else {
            onSuccess && onSuccess(token, data);
          }
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
    ];
    if (buttonText === loginButtonText) {
      mainAttributes.push({
        name: 'password',
        label: 'Password',
        type: AttributeType.Password,
        defaultValue: '',
        required: true,
      });
    }
    if (attributes && attributes.length > 0) {
      return mainAttributes.concat(attributes);
    }
    return mainAttributes;
    // don't care of `loginMutation` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes, buttonText, loginButtonText]);

  return (
    <SimpleForm
      mutation={mutation}
      buttonText={buttonText}
      attributes={completeAttributes}
    />
  );
}
