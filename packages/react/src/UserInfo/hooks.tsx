'use client';
import React from 'react';

import { componentFetch, ComponentFetchProps } from '../../lib/utils';
import { User } from '../../../server/src/users/types';

export type HookProps = ComponentFetchProps & {
  user?: User | undefined | null;
  baseUrl?: string;
};
export function useMe(props: HookProps) {
  const [user, setUser] = React.useState<User | undefined | null>(props.user);
  React.useEffect(() => {
    if (!user) {
      componentFetch(`${props?.baseUrl ?? ''}/api/me`, props)
        .then((d) => d?.json())
        .then((u) => setUser(u));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return user;
}
