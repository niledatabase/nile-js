import { QueryClient } from '@tanstack/react-query';

import { Tenant } from '../../../server/src/tenants/types';

export type HookProps = {
  tenants?: Tenant[];
  onError?: (e: Error) => void;
  baseUrl?: string;
};

export type ComponentProps = HookProps & {
  client?: QueryClient;
  activeTenant?: string;
  useCookie?: boolean;
  className?: string;
};
