import React, { useCallback, useEffect } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';

import { Tenant } from '../../../server/src/tenants/types';
import { TENANT_COOKIE } from '../../../server/src/utils/constants';
import { componentFetch } from '../../lib/utils';

import { HookProps } from './types';

export function useTenants(
  params: HookProps & { disableQuery?: boolean },
  client?: QueryClient
) {
  const { disableQuery, tenants, baseUrl = '' } = params;

  // Using useQuery to fetch tenants data
  const query = useQuery<Tenant[]>(
    {
      queryKey: ['tenants', baseUrl],
      queryFn: async () => {
        const response = await componentFetch(
          params.fetchUrl ?? '/tenants',
          {
            headers: {
              'content-type': 'application/json',
            },
          },
          params
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }

        return response.json();
      },
      enabled: !disableQuery || tenants?.length === 0,
      initialData: tenants,
    },
    client
  );

  return query;
}

export function useTenantId(
  params?: HookProps & { tenant?: Tenant },
  client?: QueryClient
): [string | undefined, (tenant: string) => void] {
  const [tenant, setTenant] = React.useState<string | undefined>(
    params?.activeTenant ?? params?.tenant?.id
  );
  const { refetch } = useTenants({ disableQuery: true, ...params }, client);

  useEffect(() => {
    if (!tenant) {
      const tenantId = getCookie(TENANT_COOKIE);
      if (tenantId) {
        setTenant(tenantId);
      } else {
        // if there's nothing in the cookie, we need to ask for tenants again
        refetch();
      }
    }
  }, [refetch, tenant]);
  const { onTenantChange } = params ?? {};

  const handleTenantSet = useCallback(
    (tenant: string) => {
      setTenant(tenant);
      setCookie(TENANT_COOKIE, tenant);
      onTenantChange ? onTenantChange(tenant) : null;
    },
    [onTenantChange]
  );
  return [tenant, handleTenantSet];
}

const getCookie = (name: string) => {
  const cookieArr = document.cookie.split('; ');
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; samesite=lax`;
};
