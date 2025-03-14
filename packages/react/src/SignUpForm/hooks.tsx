import { QueryClient, useMutation } from '@tanstack/react-query';

import { usePrefetch } from '../../lib/utils';
import { signUp } from '../../lib/auth/Authorizer';

import { Props, SignUpInfo } from './types';

export function useSignUp<T extends SignUpInfo>(
  params: Props,
  client?: QueryClient
) {
  const { onSuccess, onError, beforeMutate, ...remaining } = params;

  const mutation = useMutation(
    {
      mutationFn: async (_data) => {
        const possibleData = beforeMutate && beforeMutate(_data);
        const payload: T = { ..._data, ...possibleData };
        return await signUp({
          ...remaining,
          ...payload,
        });
      },

      onSuccess: async (data, variables) => {
        onSuccess && onSuccess(data, variables);
      },
      onError,
    },
    client
  );

  usePrefetch(params);

  return mutation.mutate;
}
