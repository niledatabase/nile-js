// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';
import { CssVarsProvider } from '@mui/joy/styles';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { Provider as MetricsProvider } from '../components/Metrics/context';

import defaultTheme from './themeJoiner';
import { NileContext, NileProviderProps, NileReactConfig } from './types';

const queryClient = new QueryClient();

const defaultContext: NileContext = {
  instance: Nile({
    basePath: 'https://prod.thenile.dev',
    workspace: 'none',
    credentials: 'include',
  }),
  workspace: '',
  database: '',
  basePath: '',
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
    database,
    tokenStorage,
    QueryProvider = BaseQueryProvider,
    basePath = 'https://prod.thenile.dev',
  } = props;

  const values = useMemo<NileContext>((): NileContext => {
    return {
      instance: Nile({
        basePath: basePath,
        workspace: workspace,
        credentials: 'include',
        tokenStorage,
      }),
      workspace: String(workspace),
      database: String(database),
      basePath,
    };
  }, [basePath, database, tokenStorage, workspace]);

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

export const useNileConfig = (): NileReactConfig => {
  const { database, workspace, basePath } = useNileContext();
  return useMemo(
    () => ({
      workspace,
      database,
      basePath,
    }),
    [basePath, database, workspace]
  );
};
