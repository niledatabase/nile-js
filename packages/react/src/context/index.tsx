// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';
import { CssVarsProvider } from '@mui/joy/styles';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { Provider as MetricsProvider } from '../components/Metrics/context';

import defaultTheme from './themeJoiner';
import { NileContext, NileProviderProps } from './types';

const queryClient = new QueryClient();

const defaultContext: NileContext = {
  instance: Nile({
    basePath: 'https://prod.thenile.dev',
    workspace: 'none',
    credentials: 'include',
  }),
};

const context = createContext<NileContext>(defaultContext);

const { Provider } = context;

export const BaseQueryProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const NileProvider = (props: NileProviderProps) => {
  const {
    children,
    theme,
    workspace,
    QueryProvider = BaseQueryProvider,
    basePath = 'https://prod.thenile.dev',
  } = props;

  const values = useMemo<NileContext>(() => {
    return {
      instance: Nile({
        basePath: basePath,
        workspace: workspace,
        credentials: 'include',
      }),
    };
  }, [basePath, workspace]);

  return (
    <QueryProvider>
      <CssVarsProvider theme={theme ?? defaultTheme}>
        <MetricsProvider>
          <Provider value={values}>{children}</Provider>
        </MetricsProvider>
      </CssVarsProvider>
    </QueryProvider>
  );
};

const useNileContext = (): NileContext => {
  return useContext(context);
};

export const useNile = (): NileApi => {
  return useNileContext().instance;
};
