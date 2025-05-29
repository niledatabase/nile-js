'use client';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { ActiveSession } from '@niledatabase/client';

import { componentFetch, ComponentFetchProps } from '../../lib/utils';
import { User } from '../../../server/src/users/types';

export type HookProps = ComponentFetchProps & {
  user?: User | undefined | null;
  baseUrl?: string;
  client?: QueryClient;
  fetchUrl?: string;
};
export function useMe(props: HookProps): User | null {
  const { baseUrl = '', fetchUrl, client, user, auth } = props;
  const { data, isLoading } = useQuery(
    {
      queryKey: ['me', baseUrl],
      queryFn: async () => {
        const res = await componentFetch(fetchUrl ?? '/me', props);
        return await res.json();
      },
      enabled: user == null,
    },
    client
  );

  if (user || data) {
    return user ?? data;
  }
  // we possibly have email, so return that while we wait for `me` to load
  if (auth && !(user && isLoading)) {
    return (auth.state?.session as ActiveSession)?.user ?? data;
  }
  return null;
}
