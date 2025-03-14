import { useMutation } from '@tanstack/react-query';

import { signIn } from '../../lib/auth/Authorizer';

import { Props } from './types';

export function useEmailSignIn(params?: Props) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    redirect = false,
    init,
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data) => {
      const d = { ..._data, callbackUrl, redirect };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;
      const res = await signIn('email', { init, ...data });
      if (res?.error) {
        throw new Error(res.error);
      }
      return res as unknown as Response;
    },
    onSuccess,
    onError,
  });
  return mutation.mutate;
}
