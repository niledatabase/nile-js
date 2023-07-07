import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { UpdateSSOProviderRequest } from '@theniledev/browser';

import SimpleForm from '../lib/SimpleForm';
import { useApi } from '../context';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';

import { Props } from './types';

export default function BaseSSOForm(props: Props & { providerName: string }) {
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
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'redirectURI',
        label: 'Redirect URI',
        type: AttributeType.Text,
        helpText: 'Where users should be redirected to upon login',
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
        helpText: 'A comma seperated list of email domains to be used',
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
    (ssoRequest: UpdateSSOProviderRequest) => {
      return api.auth.updateSSOProvider({
        providerName: providerName.toLowerCase(),
        updateSSOProviderRequest: ssoRequest,
      });
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
