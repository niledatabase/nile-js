// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import BrowserApi, { Client } from '@niledatabase/browser';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import ThemeProvider from './theme';
import { NileContext, NileProviderProps, NileReactConfig } from './types';

const queryClient = new QueryClient();

const defaultContext: NileContext = {
  api: BrowserApi({
    basePath: 'https://api.thenile.dev',
    credentials: 'include',
  }),
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
    tenantId,
    QueryProvider = BaseQueryProvider,
    basePath = 'https://api.thenile.dev',
    api,
  } = props;

  const values = useMemo<NileContext>((): NileContext => {
    return {
      api:
        api ??
        BrowserApi({
          basePath,
          credentials: 'include',
        }),
      tenantId: String(tenantId),
      basePath,
    };
  }, [api, basePath, tenantId]);

  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <Provider value={values}>{children}</Provider>
      </ThemeProvider>
    </QueryProvider>
  );
};

const useNileContext = (): NileContext => {
  return useContext(context);
};

export const useNileConfig = (): NileReactConfig => {
  const { basePath, tenantId } = useNileContext();
  return useMemo(
    () => ({
      tenantId,
      basePath,
    }),
    [basePath, tenantId]
  );
};

export const useApi = (): Client => {
  return useNileContext().api;
};
