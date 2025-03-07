import React, { useCallback, useEffect } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';

import { Tenant } from '../../../server/src/tenants/types';
import { X_NILE_TENANT } from '../../../server/src/utils/constants';

import { HookProps } from './types';

export function useTenants(
  params: HookProps & { disableQuery?: boolean },
  client?: QueryClient
) {
  const { disableQuery, tenants, baseUrl = '' } = params;

  const fetchTenants = async () => {
    const fetchUrl = `${baseUrl}/api/tenants`;
    const response = await fetch(fetchUrl, {
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }

    return response.json();
  };

  // Using useQuery to fetch tenants data
  const query = useQuery<Tenant[]>(
    {
      queryKey: ['tenants', baseUrl],
      queryFn: fetchTenants,
      enabled: !disableQuery || !tenants || tenants.length === 0,
    },
    client
  );

  return query;
}

export function useTenantId(
  params?: HookProps & { tenant: Tenant },
  client?: QueryClient
): [string | undefined, (tenant: string) => void] {
  const [tenant, setTenant] = React.useState<string | undefined>(
    params?.tenant.id
  );
  const { refetch } = useTenants({ disableQuery: true }, client);
  const { baseUrl = '' } = params ?? {};

  useEffect(() => {
    if (!tenant) {
      const tenantId = getCookie(X_NILE_TENANT);
      if (tenantId) {
        setTenant(tenantId);
      } else {
        // if there's nothing in the cookie, we need to ask for tenants again
        refetch();
      }
    }
  }, [baseUrl, refetch, tenant]);

  const handleTenantSet = useCallback((tenant: string) => {
    setTenant(tenant);
    setCookie(X_NILE_TENANT, tenant);
  }, []);
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
