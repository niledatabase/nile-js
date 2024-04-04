import Browser from '@niledatabase/browser';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  tenantId?: string;
  basePath?: string;
}

export type NileContext = NileReactConfig & {
  api: Browser;
  theme?: Theme;
};

export type NileProviderProps = NileReactConfig & {
  children: JSX.Element | JSX.Element[];
  theme?: Theme;
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
  api?: Browser;
};
