import { QueryClient, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Props, SignUpInfo } from './types';

export function useSignUp<T extends SignUpInfo>(
  params: Props,
  client?: QueryClient
) {
  const { onSuccess, onError, beforeMutate, callbackUrl } = params;

  const mutation = useMutation(
    {
      mutationFn: async (_data) => {
        const possibleData = beforeMutate && beforeMutate(_data);
        const payload: T = { ..._data, ...possibleData };
        const { tenantId, newTenantName, ...body } = payload;
        let fetchUrl =
          payload.fetchURL ?? `${window.location.origin}/api/signup`;

        const searchParams = new URLSearchParams();

        if (newTenantName) {
          searchParams.set('newTenantName', newTenantName);
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
        });
      },

      onSuccess: (data, variables) => {
        if (callbackUrl) {
          window.location.href = callbackUrl;
        }
        onSuccess && onSuccess(data, variables);
      },
      onError,
    },
    client
  );
  useEffect(() => {
    fetch('/api/auth/providers');
    fetch('/api/auth/csrf');
  }, []);
  return mutation.mutate;
}