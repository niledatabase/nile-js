import Nile from '@theniledev/js';
import React from 'react';

export interface NileContext {
  instance: Nile;
}

export interface NileProviderProps {
  children: React.ReactNode;
  apiUrl: string;
}
