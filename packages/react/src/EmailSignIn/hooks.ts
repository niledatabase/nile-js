import { signIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';

import { Props } from './types';

export function useSignIn(params?: Props) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    redirect = false,
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data) => {
      const d = { ..._data, callbackUrl, redirect };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;
      return (await signIn('email', data)) as unknown as Response;
    },
    onSuccess,
    onError,
  });
  return mutation.mutate;
}
