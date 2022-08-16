import { NileApi } from '@theniledev/js';
import React from 'react';
import { Theme } from '@mui/joy/styles';

export interface NileContext {
  instance: NileApi;
  theme?: Theme;
}

export interface NileProviderProps {
  children: React.ReactNode;
  basePath: string;
  workspace?: string;
  theme?: string;
}
