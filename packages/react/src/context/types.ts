import { NileApi, StorageOptions } from '@theniledev/js';
import { Client } from '@theniledev/browser';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  workspace: string;
  database?: string;
  tenantId?: string;
  basePath?: string;
}

export type NileContext = NileReactConfig & {
  instance: NileApi;
  api: Client;
  theme?: Theme;
};

export type NileProviderProps = NileReactConfig & {
  children: JSX.Element | JSX.Element[];
  theme?: Theme;
  tokenStorage?: StorageOptions;
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
  api?: Client;
};
