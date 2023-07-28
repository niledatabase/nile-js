import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { UpdateProviderRequest } from '@theniledev/browser';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { SSOProvider } from '@theniledev/browser';

import SimpleForm from '../lib/SimpleForm';
import { useApi } from '../context';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';

import { OktaProps } from './types';

type SSOFormRequest = Omit<
  UpdateProviderRequest,
  'emailDomains' | 'enabled'
> & {
  emailDomains: string;
  enabled: string;
};
export default function BaseSSOForm(
  props: Omit<OktaProps, 'callbackUrl' | 'providers'> & {
    providerName: string;
    configurationGuide: JSX.Element;
    config: SSOProvider;
  }
) {
  const api = useApi();
  const {
    config,
    providerName,
    onSuccess,
    onError,
    allowEdit = true,
    configurationGuide,
  } = props;
  const attributes = React.useMemo(() => {
    const attributes: Attribute[] = [
      {
        name: 'enabled',
        label: 'Allow Okta logins',
        type: AttributeType.Switch,
        defaultValue: String(config?.enabled) ?? '',
        options: [
          {
            label: 'Enabled',
          },
          {
            label: 'Disabled',
          },
        ],
        disabled: !allowEdit,
      },
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
      attributes.splice(2, 0, {
        name: 'clientSecret',
        label: 'Client secret',
        type: AttributeType.Password,
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
    config?.enabled,
  ]);

  const mutation = useMutation(
    (ssoRequest: SSOFormRequest) => {
      const payload = {
        providerName: providerName.toLowerCase(),
        updateProviderRequest: {
          ...ssoRequest,
          emailDomains: ssoRequest.emailDomains.split(','),
          enabled: ssoRequest.enabled === 'true' ? true : false,
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
    <Stack gap={2}>
      <Typography level="h4">Step 1</Typography>
      {configurationGuide}
      <Typography level="h4">Step 2</Typography>
      <SimpleForm
        mutation={mutation}
        buttonText="Update"
        attributes={attributes}
      />
    </Stack>
  );
}
