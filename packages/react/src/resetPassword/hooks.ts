import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MutateFnParams, Params } from './types';

export function useResetPassword(params?: Params) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    baseUrl = '',
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: MutateFnParams) => {
      const d = { ..._data, callbackUrl };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;

      const fetchURL = params?.fetchUrl ?? `${baseUrl}/api/auth/reset-password`;

      // should fix this in nile-auth one day
      if (
        data &&
        typeof data === 'object' &&
        'callbackUrl' in data &&
        !data.callbackUrl &&
        callbackUrl
      ) {
        data.callbackURL = callbackUrl;
      }

      data.redirectURL = fetchURL;

      return await fetch(fetchURL, {
        method: data.password ? 'put' : 'post',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
    onError,
  });

  useEffect(() => {
    fetch(`${baseUrl}/api/auth/csrf`);
  }, [baseUrl]);

  return mutation.mutate;
}
