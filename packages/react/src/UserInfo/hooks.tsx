'use client';
import { QueryClient, useQuery } from '@tanstack/react-query';

import { componentFetch, ComponentFetchProps } from '../../lib/utils';
import { User } from '../../../server/src/users/types';

export type HookProps = ComponentFetchProps & {
  user?: User | undefined | null;
  baseUrl?: string;
  client?: QueryClient;
  fetchUrl?: string;
};
export function useMe(props: HookProps) {
  const { baseUrl = '', fetchUrl, init, client, user } = props;
  const { data } = useQuery(
    {
      queryKey: ['me', baseUrl],
      queryFn: async () => {
        const res = await componentFetch(fetchUrl ?? `${baseUrl}/api/me`, init);
        return await res.json();
      },
      enabled: user == null,
    },
    client
  );

  return user ?? data;
}
