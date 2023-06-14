// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';
import BrowserApi, { Client } from '@theniledev/browser';
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
  api: BrowserApi({
    basePath: 'https://prod.thenile.dev',
    workspace: 'none',
    database: 'none',
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
    tenantId,
    tokenStorage,
    QueryProvider = BaseQueryProvider,
    basePath = 'https://prod.thenile.dev',
    api,
  } = props;

  const values = useMemo<NileContext>((): NileContext => {
    return {
      instance: Nile({
        basePath: basePath,
        workspace: workspace,
        credentials: 'include',
        tokenStorage,
      }),
      api:
        api ??
        BrowserApi({
          basePath,
          workspace,
          database,
          tenantId,
          credentials: 'include',
        }),
      workspace: String(workspace),
      database: String(database),
      tenantId: String(tenantId),
      basePath,
    };
  }, [basePath, workspace, tokenStorage, database, tenantId, api]);

  return (
    <QueryProvider>
      <CssVarsProvider defaultMode="system" theme={theme ?? defaultTheme}>
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
  const { database, workspace, basePath, tenantId } = useNileContext();
  return useMemo(
    () => ({
      workspace,
      database,
      tenantId,
      basePath,
    }),
    [basePath, database, workspace, tenantId]
  );
};

export const useNileApi = (): Client => {
  return useNileContext().api;
};
