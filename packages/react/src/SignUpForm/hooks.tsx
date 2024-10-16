import { useMutation } from '@tanstack/react-query';

import { Props, SignUpInfo } from './types';

export function useSignUp<T extends SignUpInfo>(params: Props) {
  const { onSuccess, onError, beforeMutate } = params;

  const mutation = useMutation({
    mutationFn: async (_data) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const payload: T = { ..._data, ...possibleData };
      const { tenantId, newTenantName, ...body } = payload;
      let fetchUrl = `${window.location.origin}/api/users`;

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

    onSuccess,
    onError,
  });
  return mutation.mutate;
}
