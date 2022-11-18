import { NileApi } from '@theniledev/js';
import { Theme } from '@mui/joy/styles';

export interface NileContext {
  instance: NileApi;
  theme?: Theme;
}

export interface NileProviderProps {
  children: JSX.Element | JSX.Element[];
  basePath: string;
  workspace?: string;
  theme?: Theme;
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
}
