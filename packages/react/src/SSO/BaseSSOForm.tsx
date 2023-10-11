import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { UpdateProviderRequest, SSOProvider } from '@niledatabase/browser';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';

import SimpleForm from '../lib/SimpleForm';
import { useApi } from '../context';
import { Attribute, AttributeType } from '../lib/SimpleForm/types';

import { OktaProps } from './types';

type SSOFormRequest = Omit<UpdateProviderRequest, 'emailDomains'> & {
  emailDomains: string;
};
export default function BaseSSOForm(
  props: Omit<OktaProps, 'callbackUrl' | 'providers'> & {
    providerName: string;
    configurationGuide: JSX.Element;
    config: SSOProvider;
  }
) {
  const {
    config,
    providerName,
    onSuccess,
    onError,
    allowEdit = true,
    configurationGuide,
  } = props;

  const api = useApi();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [optimisticConfig, setConfig] = React.useState<SSOProvider>(config);
  const timer = React.useRef<NodeJS.Timeout>();
  const attributes = React.useMemo(() => {
    const attributes: Attribute[] = [
      {
        name: 'enabled',
        label: 'Allow Okta logins',
        type: AttributeType.Switch,
        defaultValue: optimisticConfig?.enabled === true,
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
        defaultValue: optimisticConfig?.clientId ?? '',
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'configUrl',
        label: 'Config url',
        type: AttributeType.Text,
        defaultValue: optimisticConfig?.configUrl ?? '',
        helpText:
          'The URL of the .well-known/openid-configuration for the identity provider',
        required: true,
        disabled: !allowEdit,
      },
      {
        name: 'emailDomains',
        label: 'Email domains',
        type: AttributeType.Text,
        defaultValue: optimisticConfig?.emailDomains?.join(', ') ?? '',
        required: true,
        helpText:
          'A comma seperated list of email domains (yourDomain.com) to be used',
        disabled: !allowEdit,
      },
    ];
    if (!optimisticConfig?.clientId) {
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
    optimisticConfig?.clientId,
    optimisticConfig?.configUrl,
    optimisticConfig?.emailDomains,
    optimisticConfig?.enabled,
  ]);

  const handleTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const mutation = useMutation(
    (ssoRequest: SSOFormRequest) => {
      setLoading(true);
      const payload = {
        providerName: providerName.toLowerCase(),
        updateProviderRequest: {
          ...ssoRequest,
          emailDomains: ssoRequest.emailDomains.split(','),
        },
      };
      if (optimisticConfig != null) {
        return api.auth.updateProvider(payload);
      } else {
        return api.auth.createProvider(payload);
      }
    },
    {
      onSuccess: (data, vars) => {
        setConfig(data);
        setSuccess(true);
        onSuccess && onSuccess(data, vars);
      },
      onError,
      onSettled: (data, error, vars) => {
        setLoading(false);
        handleTimer();
        if (!data) {
          if (!error || error?.message.includes('Unterminated string')) {
            // something unexpected happened on the BE, but it's non-fatal
            setConfig({
              enabled: vars.enabled,
              clientId: vars.clientId,
              configUrl: vars.configUrl,
              emailDomains: vars.emailDomains.split(', '),
            } as SSOProvider);
          }
          setSuccess(true);
          onSuccess && onSuccess(data, vars);
        }
      },
    }
  );

  React.useEffect(() => {
    () => {
      clearTimeout(timer.current);
    };
  });

  return (
    <Stack gap={2} position="relative">
      <Typography level="h4">Step 1</Typography>
      {configurationGuide}
      <Typography level="h4">Step 2</Typography>
      <SimpleForm
        mutation={mutation}
        buttonText="Update"
        attributes={attributes}
        loading={loading}
        successMessage={
          <Alert
            color="success"
            sx={{
              opacity: success ? 1 : 0,
              transition: 'opacity 200ms',
              height: '0.9rem',
            }}
            startDecorator={<CheckCircleOutlined />}
          >
            <Typography textAlign="center" fontSize="sm">
              Provider updated
            </Typography>
          </Alert>
        }
      />
    </Stack>
  );
}
