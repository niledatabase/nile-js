// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme } from '@mui/joy/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';

import defaultTheme from './config';

export default function Themer({
  theme,
  children,
}: {
  theme?: Theme;
  children: JSX.Element;
}) {
  return (
    <JoyCssVarsProvider theme={theme ?? defaultTheme} defaultMode="dark">
      <CssBaseline enableColorScheme />
      {children}
    </JoyCssVarsProvider>
  );
}
