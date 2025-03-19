import { useMutation } from '@tanstack/react-query';

import { componentFetch, useCsrf } from '../../lib/utils';

import { MutateFnParams, Params } from './types';

export function useResetPassword(params?: Params) {
  const {
    onSuccess,
    onError,
    beforeMutate,
    callbackUrl,
    baseUrl = '',
    basePath = 'api',
  } = params ?? {};
  const mutation = useMutation({
    mutationFn: async (_data: MutateFnParams) => {
      const d = { ..._data, callbackUrl };
      const possibleData = beforeMutate && beforeMutate(d);
      const data = possibleData ?? d;

      const fetchURL =
        params?.fetchUrl ?? `${baseUrl}/${basePath}/auth/reset-password`;

      // should fix this in nile-auth one day
      if (
        data &&
        typeof data === 'object' &&
        'callbackUrl' in data &&
        !data.callbackUrl &&
        callbackUrl
      ) {
        data.callbackURL = callbackUrl;
      }

      data.redirectURL = fetchURL;

      return await componentFetch(
        '/auth/reset-password',
        { method: data.password ? 'put' : 'post', body: JSON.stringify(data) },
        params
      );
    },
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
    onError,
  });

  useCsrf(params);

  return mutation.mutate;
}
