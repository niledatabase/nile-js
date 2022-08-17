import { NileApi } from '@theniledev/js';
import React from 'react';
import { Theme } from '@mui/joy/styles';
import { QueryClient } from '@tanstack/react-query';

export interface NileContext {
  instance: NileApi;
  theme?: Theme;
}

export interface NileProviderProps {
  children: React.ReactNode;
  basePath: string;
  workspace?: string;
  theme?: Theme;
  queryClient?: QueryClient;
}
