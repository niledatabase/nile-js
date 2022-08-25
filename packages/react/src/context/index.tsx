// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';
import { CssVarsProvider } from '@mui/joy/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import defaultTheme from './themeJoiner';
import { NileContext, NileProviderProps } from './types';

const defaultQueryClient = new QueryClient();

const defaultContext: NileContext = {
  instance: Nile({ basePath: '', workspace: 'none', credentials: 'include' }),
};

const context = createContext<NileContext>(defaultContext);
const { Provider } = context;

export const NileProvider = (props: NileProviderProps) => {
  const { children, theme, queryClient } = props;

  const values = useMemo<NileContext>(() => {
    return {
      instance: Nile({
        basePath: props.basePath,
        workspace: props.workspace,
        credentials: 'include',
      }),
    };
  }, [props.basePath, props.workspace]);

  return (
    <QueryClientProvider client={queryClient ?? defaultQueryClient}>
      <CssVarsProvider theme={theme ?? defaultTheme}>
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
