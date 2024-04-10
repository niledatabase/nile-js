// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import React, { useMemo, createContext, useContext } from 'react';
import Browser from '@niledatabase/browser';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import ThemeProvider from './theme';
import { NileContext, NileProviderProps, NileReactConfig } from './types';

const queryClient = new QueryClient();

const defaultContext: NileContext = {
  api: new Browser({
    basePath: 'https://api.thenile.dev',
    credentials: 'include',
  }),
  apiUrl: '',
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
    slotProps,
    tenantId,
    QueryProvider = BaseQueryProvider,
    appUrl,
    apiUrl = 'https://api.thenile.dev',
    api,
  } = props;

  const values = useMemo<NileContext>((): NileContext => {
    return {
      api:
        api ??
        new Browser({
          basePath: appUrl,
          credentials: 'include',
        }),
      tenantId: String(tenantId),
      apiUrl,
    };
  }, [api, apiUrl, appUrl, tenantId]);

  return (
    <QueryProvider>
      <ThemeProvider slotProps={slotProps?.provider} theme={theme}>
        <Provider value={values}>{children}</Provider>
      </ThemeProvider>
    </QueryProvider>
  );
};

const useNileContext = (): NileContext => {
  return useContext(context);
};

export const useNileConfig = (): NileReactConfig => {
  const { apiUrl, tenantId, appUrl } = useNileContext();
  return useMemo(
    () => ({
      tenantId,
      apiUrl,
      appUrl,
    }),
    [apiUrl, tenantId, appUrl]
  );
};

export const useApi = (): Browser => {
  return useNileContext().api;
};
