import Browser from '@niledatabase/browser';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  tenantId?: string;
  basePath?: string; // defaults to https://api.thenile.dev
}

export type NileContext = NileReactConfig & {
  api: Browser;
  theme?: Theme;
};

export type NileProviderProps = NileReactConfig & {
  children: JSX.Element | JSX.Element[];
  theme?: Theme;
  slotProps?: {
    provider?: Record<string, string>;
  };
  QueryProvider?: (props: { children: JSX.Element }) => JSX.Element;
  api?: Browser;
};
