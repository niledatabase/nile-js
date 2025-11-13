import { QueryClient, useMutation } from '@tanstack/react-query';
import { signUp } from '@niledatabase/client';

import { usePrefetch } from '../../lib/utils';
import { useQueryClientOrDefault } from '../../lib/queryClient';

import { Props, SignUpInfo } from './types';

export function useSignUp<T extends SignUpInfo>(
  params: Props,
  client?: QueryClient
) {
  const { onSuccess, onError, beforeMutate, ...remaining } = params;
  const queryClient = useQueryClientOrDefault(client);

  const mutation = useMutation(
    {
      mutationFn: async (_data) => {
        const possibleData = beforeMutate && beforeMutate(_data);
        const payload: T = { ..._data, ...possibleData };
        const { data, error } = await signUp({
          ...remaining,
          ...payload,
        });
        if (error) {
          throw new Error(error);
        }
        return data;
      },

      onSuccess,
      onError,
    },
    queryClient
  );

  usePrefetch(params);

  return mutation.mutate;
}
