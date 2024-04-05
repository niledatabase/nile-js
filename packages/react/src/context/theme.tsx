// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme } from '@mui/joy/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';

export default function Themer({
  theme,
  children,
  slotProps,
}: {
  theme?: Theme;
  children: JSX.Element;
  slotProps?: Record<string, string>;
}) {
  return (
    <JoyCssVarsProvider {...slotProps} theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </JoyCssVarsProvider>
  );
}
