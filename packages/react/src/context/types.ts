import {NileApi} from '@theniledev/js';
import React from 'react';

export interface NileContext {
  instance: NileApi;
  theme?: string
}

export interface NileProviderProps {
  children: React.ReactNode;
  apiUrl: string;
  theme?: string;
}
