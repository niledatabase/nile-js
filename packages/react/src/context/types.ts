import Browser from '@niledatabase/browser';
import { Theme } from '@mui/joy/styles';

export interface NileReactConfig {
  tenantId?: string;
  apiUrl?: string; // the FQDN for the database
  appUrl?: string; // the FQDN BE application the UI will send requests to, matching `Browser` in OpenAPI spec
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
