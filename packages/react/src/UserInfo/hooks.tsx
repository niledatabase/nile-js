'use client';
import React from 'react';

import { User } from '../../../server/src/users/types';

type Props = {
  fetchUrl?: string;
  user?: User | undefined | null;
};
export function useMe(props: Props) {
  const [user, setUser] = React.useState<User | undefined | null>(props.user);
  React.useEffect(() => {
    if (!user) {
      fetch(props.fetchUrl ?? '/api/me')
        .then((d) => d?.json())
        .then((u) => setUser(u));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return user;
}
