import { useMutation } from '@tanstack/react-query';

import { signIn } from '../../lib/auth';

import { Props, LoginInfo } from './types';

export function useSignIn(params?: Props) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    init,
    baseUrl,
    fetchUrl,
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: LoginInfo) => {
      const d = { ..._data, callbackUrl };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;
      return await signIn('credentials', { init, baseUrl, fetchUrl, ...data });
    },
    onSuccess,
    onError,
  });
  return mutation.mutate;
}
