import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NileProvider } from '@theniledev/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NileProvider apiUrl="http://localhost:8080" theme="fancy">
      <Component {...pageProps} />
    </NileProvider>
  );
}

export default MyApp;
