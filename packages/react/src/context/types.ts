import { NileService } from '@theniledev/js';
import React from 'react';
import { Theme } from '../global-types'

export interface NileContext {
  instance: NileService;
  theme: Theme | string
}

export interface NileProviderProps {
  children: React.ReactNode;
  apiUrl: string;
  theme: Theme | string,
}
