import { QueryClient, useMutation } from '@tanstack/react-query';

import { usePrefetch } from '../../lib/utils';
import { getSession } from '../../lib/auth';

import { Props, SignUpInfo } from './types';

export function useSignUp<T extends SignUpInfo>(
  params: Props,
  client?: QueryClient
) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    baseUrl = '',
    createTenant,
    init,
  } = params;

  const mutation = useMutation(
    {
      mutationFn: async (_data) => {
        const possibleData = beforeMutate && beforeMutate(_data);
        const payload: T = { ..._data, ...possibleData };
        const { tenantId, newTenantName, ...body } = payload;
        let fetchUrl = payload.fetchUrl ?? `${baseUrl}/api/signup`;

        const searchParams = new URLSearchParams();

        if (newTenantName) {
          searchParams.set('newTenantName', newTenantName);
        } else if (createTenant) {
          if (typeof createTenant === 'boolean') {
            searchParams.set('newTenantName', payload.email);
          } else if (typeof createTenant === 'string') {
            searchParams.set('newTenantName', createTenant);
          }
        }
        if (tenantId) {
          searchParams.set('tenantId', tenantId);
        }

        if (searchParams.size > 0) {
          fetchUrl += `?${searchParams}`;
        }

        return await fetch(fetchUrl, {
          body: JSON.stringify(body),
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          ...init,
        });
      },

      onSuccess: async (data, variables) => {
        if (data.ok) {
          // consolidate this double session call one day
          await getSession({ event: 'storage' });
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            window.location.reload();
          }
        }
        onSuccess && onSuccess(data, variables);
      },
      onError,
    },
    client
  );

  usePrefetch(params);

  return mutation.mutate;
}
