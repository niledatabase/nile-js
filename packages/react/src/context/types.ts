import {NileService} from '@theniledev/js';
import React from 'react';

export interface NileContext {
  instance: NileService;
}

export interface NileProviderProps {
  children: React.ReactNode;
  apiUrl: string;
}
