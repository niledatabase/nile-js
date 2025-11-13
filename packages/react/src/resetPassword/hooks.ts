import { useMutation } from '@tanstack/react-query';
import { resetPassword, forgotPassword } from '@niledatabase/client';

import { useCsrf } from '../../lib/utils';
import { useQueryClientOrDefault } from '../../lib/queryClient';

import { MutateFnParams, Params } from './types';

export function useResetPassword(params?: Params) {
  const {
    auth,
    baseUrl = '',
    beforeMutate,
    client,
    callbackUrl,
    fetchUrl,
    init,
    onError,
    onSuccess,
    redirect = false,
    client: paramsClient,
  } = params ?? {};
  const queryClient = useQueryClientOrDefault(client ?? paramsClient);
  const mutation = useMutation(
    {
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
    },
    queryClient
  );

  useCsrf(params);

  return mutation.mutate;
}

export function useForgotPassword(params?: Params) {
  const {
    auth,
    baseUrl = '',
    beforeMutate,
    callbackUrl,
    fetchUrl,
    init,
    client,
    onError,
    onSuccess,
    redirect = false,
    client: paramsClient,
  } = params ?? {};
  const queryClient = useQueryClientOrDefault(client ?? paramsClient);
  const mutation = useMutation(
    {
      mutationFn: async (_data: { password: string }) => {
        const possibleData = beforeMutate && beforeMutate(_data);
        const data = possibleData ?? _data;

        return await forgotPassword({
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
    },
    queryClient
  );

  useCsrf(params);

  return mutation.mutate;
}
