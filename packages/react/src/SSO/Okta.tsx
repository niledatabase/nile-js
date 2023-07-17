import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Input from '@mui/joy/Input';
import CopyAll from '@mui/icons-material/CopyAll';
import { Theme } from '@mui/joy/styles';
import Tooltip from '@mui/joy/Tooltip';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { SSOProvider } from '@theniledev/browser';

import BaseSSOForm from './BaseSSOForm';
import { OktaProps } from './types';

function ConfigGuide({ callbackUrl }: { callbackUrl: string }) {
  const [copied, setCopied] = React.useState(false);

  const timer = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setCopied(false);
    }, 3250);
    () => {
      clearTimeout(timer.current);
    };
  }, [copied]);
  return (
    <Stack gap={2}>
      <Typography>
        In order for Okta to redirect properly, provide the following URL as the{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>
          Sign-in redirect URIs
        </Box>{' '}
        in the admin configuration of your application.
      </Typography>
      <Input
        onClick={async () => {
          await navigator.clipboard.writeText(callbackUrl);
          setCopied(true);
        }}
        sx={(theme: Theme) => ({
          input: {
            cursor: 'pointer',
          },
          span: {
            cursor: 'pointer',
          },
          '&:hover svg': {
            '--Icon-color': theme.palette.primary[500],
          },
        })}
        value={callbackUrl}
        readOnly={true}
        endDecorator={
          <Tooltip title="Copy Okta redirect URL">
            <Box position="relative" width="24px" height="24px">
              <Box position="absolute" top="0" left="0">
                <CopyAll
                  sx={{
                    opacity: copied ? 0 : 1,
                    transition: 'opacity 300ms',
                  }}
                />
              </Box>
              <Box position="absolute" top="0" left="0">
                <CheckCircleOutlined
                  sx={{
                    opacity: !copied ? 0 : 1,
                    transition: 'opacity 300ms',
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
        }
      />
    </Stack>
  );
}

export default function Okta(props: OktaProps) {
  const { callbackUrl, providers, ...remaining } = props;
  const config = providers?.find((provider) => provider.provider === 'okta');
  return (
    <BaseSSOForm
      {...remaining}
      config={config as SSOProvider}
      providerName="Okta"
      configurationGuide={<ConfigGuide callbackUrl={callbackUrl} />}
    />
  );
}
