import { QueryClient } from '@tanstack/react-query';

import { Tenant } from '../../../server/src/tenants/types';
import { ComponentFetchProps } from '../../lib/utils';

export type HookProps = ComponentFetchProps & {
  client?: QueryClient;
  fetchUrl?: string;
  tenants?: Tenant[];
  onError?: (e: Error) => void;
  onTenantChange?: (tenant: string) => void;
  activeTenant?: string | null | undefined;
};

export type ComponentProps = HookProps & {
  useCookie?: boolean;
  className?: string;
  emptyText?: string;
  buttonText?: string;
};
