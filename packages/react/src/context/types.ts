import { NileApi, StorageOptions } from '@theniledev/js';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  workspace: string;
  database?: string;
  basePath?: string;
  allowClientCookies?: boolean;
}

export type NileContext = NileReactConfig & {
  instance: NileApi;
  theme?: Theme;
};

export type NileProviderProps = NileReactConfig & {
  children: JSX.Element | JSX.Element[];
  theme?: Theme;
  tokenStorage?: StorageOptions;
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
};
