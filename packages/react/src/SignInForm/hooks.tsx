import { useMutation } from '@tanstack/react-query';

import { signIn } from '../../lib/auth/Authorizer';

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
    auth,
    redirect,
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: LoginInfo) => {
      const d = { ..._data, callbackUrl };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;
      const res = await signIn('credentials', {
        init,
        auth,
        baseUrl,
        fetchUrl,
        redirect,
        ...data,
      });
      if (!res?.ok && res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess,
    onError,
  });
  return mutation.mutate;
}
