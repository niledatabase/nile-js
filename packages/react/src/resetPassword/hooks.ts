import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@niledatabase/client';

import { useCsrf } from '../../lib/utils';

import { MutateFnParams, Params } from './types';

export function useResetPassword(params?: Params) {
  const {
    auth,
    baseUrl = '',
    beforeMutate,
    callbackUrl,
    fetchUrl,
    init,
    onError,
    onSuccess,
    redirect = false,
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: MutateFnParams) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;

      return await resetPassword({
        auth,
        baseUrl,
        callbackUrl,
        fetchUrl,
        init,
        redirect,
        ...data,
      });
    },
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
    onError,
  });

  useCsrf(params);

  return mutation.mutate;
}
