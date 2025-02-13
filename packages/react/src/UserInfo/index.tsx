'use client';
import { BadgeCheck, CalendarCheck, CircleUserRound, Mail } from 'lucide-react';
import React from 'react';

type Props = {
  user?: {
    picture?: string;
    name?: string;
    familyName?: string;
    givenName?: string;
    emailVerified?: Date | void;
    email: string;
    created: Date;
  };
  fetchUrl?: string;
  profilePicturePlaceholder?: React.ReactElement;
};
export default function UserInfo(props: Props) {
  const [user, setUser] = React.useState(props.user);
  React.useEffect(() => {
    if (!user) {
      fetch(props.fetchUrl ?? '/api/me')
        .then((d) => d.json())
        .then((u) => setUser(u));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      <div style={{ background: randomGradient() }}>
        <CircleUserRound
          size={100}
          className="opacity-90 stroke-white"
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
    <div className="flex flex-col gap-2 items-center">
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
function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

function randomGradient() {
  const color1 = randomHexColor();
  const color2 = randomHexColor();
  const angle = Math.floor(Math.random() * 360); // Random angle between 0-360 degrees

  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}
