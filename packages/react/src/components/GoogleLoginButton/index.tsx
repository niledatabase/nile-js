import React from 'react';
import { Button, Typography, Box, Stack } from '@mui/joy';

import { useNile } from '../../context';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GoogleLogo from './google.svg';

type LogInGoogleProps = {
  org?: string;
};
/**
 * Basic component for a google login form
 */
export default function LogInGoogle(props: LogInGoogleProps) {
  const nile = useNile();
  const { org } = props;
  const href = React.useMemo(() => {
    if (org) {
      return nile.organizations.oidc.GOOGLE(org);
    }
    return nile.workspaces.oidc.providers.GOOGLE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  return (
    <Box
      component="a"
      href={href}
      sx={{ display: 'flex', flex: 1, textDecoration: 'none' }}
    >
      <Box>
        <Button sx={{ padding: 0, textTransform: 'initial', flex: 1 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
              color: 'rgb(255, 255, 255)',
              boxShadow:
                'rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px',
              padding: '0px',
              borderRadius: '4px',
              border: '1px solid transparent',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'rgb(66, 133, 244)',
              fontFamily: 'Roboto, sans-serif',
              flex: 1,
            }}
          >
            <Box
              sx={{
                padding: '11px',
                background: 'rgb(255, 255, 255)',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                display: 'flex',
                border: '1px solid rgb(66, 133, 244)',
                borderRadius: '4px',
              }}
            >
              <GoogleLogo />
            </Box>
            <Box
              sx={{
                padding: '10px',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
                flex: 1,
              }}
            >
              <Typography
                sx={{ color: 'white' }}
                fontWeight={700}
                fontFamily="Roboto, sans-serif"
                fontSize="14px"
                height="20px"
              >
                Continue with Google
              </Typography>
            </Box>
          </Stack>
        </Button>
      </Box>
    </Box>
  );
}
