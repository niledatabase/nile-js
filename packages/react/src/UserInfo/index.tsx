'use client';
import { BadgeCheck, CalendarCheck, CircleUserRound, Mail } from 'lucide-react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { cn } from '../../lib/utils';

import { HookProps, useMe } from './hooks';

export { useMe } from './hooks';

type Props = HookProps & {
  profilePicturePlaceholder?: React.ReactElement;
  className?: string;
};
const queryClient = new QueryClient();
export default function UserInfo(props: Props) {
  return (
    <QueryClientProvider client={queryClient ?? props.client}>
      <UserInfoC {...props} />
    </QueryClientProvider>
  );
}
function UserInfoC(props: Props) {
  const user = useMe(props);
  const picture = React.useMemo(() => {
    if (user && typeof user === 'object' && 'picture' in user && user.picture) {
      return (
        <img
          src={user.picture}
          alt={`${user.name} profile picture`}
          referrerPolicy="no-referrer"
        />
      );
    }

    if (props.profilePicturePlaceholder) {
      return props.profilePicturePlaceholder;
    }
    return (
      <div
        className="drop-shadow-md"
        style={{
          background: 'linear-gradient(90deg, #F4C587, #D6D3E9, #99D2EC)',
        }}
      >
        <CircleUserRound
          size={100}
          className="opacity-70 stroke-black"
          style={{ strokeWidth: '.5px' }}
        />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user == null]);

  if (!user) {
    return 'Loading...';
  }

  return (
    <div className={cn(props.className, 'flex flex-col gap-2 items-center')}>
      <div className="flex flex-col gap-5 pb-2 items-center">
        <div className="flex flex-col gap-2 items-center w-36 mx-auto">
          <div className="rounded-full border border-background overflow-hidden shadow-md">
            {picture}
          </div>
        </div>
        <div className="font-bold flex flex-row gap-1 capitalize">
          {user.name ? user.name : user.givenName}{' '}
          {user.familyName ? user.familyName : null}
        </div>
      </div>
      <div className="flex flex-row gap-5 justify-between w-full">
        <div className="flex flex-row gap-2 text-sm items-center w-36">
          <Mail size={14} />
          Email:
        </div>
        <div className="flex flex-row gap-1 items-center">
          {user.emailVerified ? (
            <BadgeCheck className="stroke-white fill-green-700" size={14} />
          ) : (
            <BadgeCheck className="opacity-40" size={14} />
          )}
          {user.email}{' '}
        </div>
      </div>
      <div className="flex flex-row gap-5 justify-between w-full">
        <div className="flex flex-row gap-2 text-sm items-center w-36">
          <CalendarCheck size={14} />
          Created:
        </div>
        {new Date(user.created).toLocaleString()}
      </div>
    </div>
  );
}
