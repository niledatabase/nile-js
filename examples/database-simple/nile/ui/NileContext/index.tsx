'use client';

import { NileProvider } from '@theniledev/react';

export default function NileContext(props: { children: JSX.Element }) {
  return (
    <NileProvider
      workspace={String(process.env.NEXT_PUBLIC_WORKSPACE)}
      database={String(process.env.NEXT_PUBLIC_DATABASE)}
      basePath={String(process.env.NEXT_PUBLIC_BASE_PATH)}
    >
      {props.children}
    </NileProvider>
  );
}