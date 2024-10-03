import { useMutation } from '@tanstack/react-query';

import { Props, SignUpInfo } from './types';

export function useSignUp<T = SignUpInfo>(params: Props) {
  const { onSuccess, onError, beforeMutate } = params;

  const mutation = useMutation({
    mutationFn: async (_data) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const payload: T = { ..._data, ...possibleData };

      return await fetch(`${window.location.origin}/api/users`, {
        body: JSON.stringify(payload),
        method: 'POST',
      });
    },

    onSuccess,
    onError,
  });
  return mutation.mutate;
}
