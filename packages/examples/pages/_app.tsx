import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NileProvider } from '@theniledev/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NileProvider basePath="http://localhost:8080" workspace="1">
        <Component {...pageProps} />
      </NileProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
