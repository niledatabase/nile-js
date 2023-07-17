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
    disableSSO = false,
  } = props;
  const api = useApi();
  const [buttonText, setButtonText] = React.useState(
    disableSSO ? loginButtonText : nextButtonText
  );

  const mutation = useMutation(
    async (_data: LoginInfo) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;
      return await api.auth.login({
        loginRequest: { email: data.email, password: data.password },
        sso: !disableSSO,
      });
    },
    {
      onSuccess: (token, data) => {
        if (token) {
          if (token?.redirectURI) {
            window.location.href = token.redirectURI;
          } else if (buttonText !== loginButtonText) {
            setButtonText(loginButtonText);
          } else {
            onSuccess && onSuccess(token, data);
          }
        }
      },
      onError: (error, data) => {
        // it is possible SSO failed, so only show errors on if the password is available
        if (buttonText === loginButtonText) {
          onError && onError(error as Error, data);
        } else {
          setButtonText(loginButtonText);
        }
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
  }, [attributes, buttonText, loginButtonText]);

  return (
    <SimpleForm
      mutation={mutation}
      buttonText={buttonText}
      attributes={completeAttributes}
    />
  );
}
