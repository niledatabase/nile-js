import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MutateFnParams, Params } from './types';

export function useResetPassword(params?: Params) {
  const { onSuccess, onError, beforeMutate, callbackURL } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: MutateFnParams) => {
      const d = { ..._data, callbackURL };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;

      const fetchURL =
        params?.fetchURL ?? `${window.location.origin}/api/auth/reset-password`;

      if (
        data &&
        typeof data === 'object' &&
        'callbackURL' in data &&
        !data.callbackURL &&
        callbackURL
      ) {
        data.callbackURL = callbackURL;
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
    fetch('/api/auth/csrf');
  }, []);

  return mutation.mutate;
}
