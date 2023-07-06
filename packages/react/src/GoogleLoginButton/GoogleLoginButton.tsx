import React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

import { useNileConfig } from '../context';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GoogleLogo from './google.svg';

const LOGIN_PATH = 'users/oidc/google/login';

/**
 * A compponent for a Google login button, according to their design language.
 * This works when an identity provider is configured in the admin dashboard.
 * @param props href: a string to override the URL provided by the context
 * @returns a JSX.Element to render
 */
export default function GoogleSSOButton(props: {
  href?: string;
  workspace?: string;
  database?: string;
}) {
  const { workspace, database } = props;
  const { basePath } = useNileConfig();
  // workspace and database can be `''`.
  // let this fail silently for now, and update the context when the time comes
  const contextHref = `${basePath}/workspaces/${workspace}/databases/${database}/${LOGIN_PATH}`;
  const href = props?.href ?? contextHref;
  return (
    <Box
      component="a"
      href={href}
      display="flex"
      flex={1}
      sx={{ textDecoration: 'none' }}
    >
      <Box>
        <Button
          sx={{ padding: 0, textTransform: 'initial', flex: 1 }}
          aria-label="log in with google"
        >
          <Stack
            direction="row"
            alignItems="center"
            p={0}
            flex={1}
            fontFamily="Roboto, sans-serif"
            fontSize="14px"
            display="inline-flex"
            color="rgb(255 255, 255)"
            boxShadow="rgb(0 0 0 / 24%) 0px 2px 2px 0px rgb(0 0 0 / 24%) 0px 0px 1px 0px"
            borderRadius="4px"
            border="1px solid transparent"
            fontWeight="500"
            sx={{
              backgroundColor: 'rgb(66 133, 244)',
            }}
          >
            <Box
              padding="11px"
              display="flex"
              border="1px solid rgb(66, 133, 244)"
              borderRadius="4px"
              sx={{
                background: 'rgb(255, 255, 255)',
              }}
            >
              <GoogleLogo aria-hidden="true" />
            </Box>
            <Box padding="10px" flex={1}>
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
