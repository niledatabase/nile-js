import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NileProvider } from '@theniledev/react';
import { StorageOptions } from '@theniledev/js';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NileProvider
      basePath="http://localhost:8080"
      workspace="toastr2"
      tokenStorage={StorageOptions.LocalStorage}
    >
      <Component {...pageProps} />
    </NileProvider>
  );
}

export default MyApp;
