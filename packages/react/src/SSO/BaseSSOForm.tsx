import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { UpdateProviderRequest } from '@theniledev/browser';

import SimpleForm from '../lib/SimpleForm';
import { useApi } from '../context';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';

import { OktaProps } from './types';

export default function BaseSSOForm(
  props: OktaProps & { providerName: string }
) {
  const api = useApi();
  const { config, providerName, onSuccess, onError, allowEdit = true } = props;
  const attributes = React.useMemo(() => {
    const attributes: Attribute[] = [
      {
        name: 'clientId',
        label: 'Client id',
        type: AttributeType.Text,
        defaultValue: config?.clientId ?? '',
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'configUrl',
        label: 'Config url',
        type: AttributeType.Text,
        defaultValue: config?.configUrl ?? '',
        helpText:
          'The URL of the .well-known/openid-configuration for the identity provider',
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'redirectURI',
        label: 'Redirect URI',
        type: AttributeType.Text,
        helpText:
          'Where users should be redirected to after a successful login',
        defaultValue: config?.redirectURI ?? '',
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'emailDomains',
        label: 'Email domains',
        type: AttributeType.Text,
        defaultValue: config?.emailDomains?.join(', ') ?? '',
        required: true,
        helpText:
          'A comma seperated list of email domains (@yourDomain.com) to be used',
        disabled: !allowEdit,
      },
    ];
    if (!config?.clientId) {
      attributes.splice(1, 0, {
        name: 'clientSecret',
        label: 'Client secret',
        type: AttributeType.Text,
        defaultValue: '',
        required: true,
        disabled: !allowEdit,
      });
    }
    return attributes;
  }, [
    allowEdit,
    config?.clientId,
    config?.configUrl,
    config?.emailDomains,
    config?.redirectURI,
  ]);

  const mutation = useMutation(
    (ssoRequest: UpdateProviderRequest & { emailDomains: string }) => {
      const payload = {
        providerName: providerName.toLowerCase(),
        updateProviderRequest: {
          ...ssoRequest,
          emailDomains: ssoRequest.emailDomains.split(','),
        },
      };
      if (config != null) {
        return api.auth.updateProvider(payload);
      } else {
        return api.auth.createProvider(payload);
      }
    },
    {
      onSuccess,
      onError,
    }
  );

  return (
    <SimpleForm
      mutation={mutation}
      buttonText="Update"
      attributes={attributes}
    />
  );
}
