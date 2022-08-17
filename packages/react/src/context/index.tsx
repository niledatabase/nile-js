// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';
import { CssVarsProvider } from '@mui/joy/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import theme from './themeJoiner';
import { NileContext, NileProviderProps } from './types';

const queryClient = new QueryClient();

const defaultContext: NileContext = {
  instance: Nile({ basePath: '', workspace: 'none', credentials: 'include' }),
  workspace: '',
};

const context = createContext<NileContext>(defaultContext);
const { Provider } = context;

export const NileProvider = (props: NileProviderProps) => {
  const { children } = props;

  const values = useMemo<NileContext>(() => {
    return {
      instance: Nile({
        basePath: props.basePath,
        workspace: props.workspace,
        credentials: 'include',
      }),
    };
  }, [props.basePath, props.workspace]);

  if (props.theme) {
    return (
      <QueryClientProvider client={queryClient}>
        <CssVarsProvider theme={props.theme}>
          <Provider value={values}>{children}</Provider>
        </CssVarsProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CssVarsProvider theme={theme}>
        <Provider value={values}>{children}</Provider>
      </CssVarsProvider>
    </QueryClientProvider>
  );
};

const useNileContext = (): NileContext => {
  return useContext(context);
};

export const useNile = (): NileApi => {
  return useNileContext().instance;
};
