import { Client } from '@theniledev/browser';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  tenantId?: string;
  basePath?: string;
}

export type NileContext = NileReactConfig & {
  api: Client;
  theme?: Theme;
};

export type NileProviderProps = NileReactConfig & {
  children: JSX.Element | JSX.Element[];
  theme?: Theme;
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
  api?: Client;
};
