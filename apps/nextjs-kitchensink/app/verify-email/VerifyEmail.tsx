import { Google, UserInfo } from '@niledatabase/react';

import { nile } from '../api/[...nile]/nile';

import VerifyEmailForm from './VerifyEmailForm';

export default async function VerifyEmail() {
  const me = await nile.users.getSelf();
  if (me instanceof Response) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-red-500 text-2xl">
          You must be logged in to verify your email address.
        </div>
        <div>
          <Google callbackUrl="/verify-email" />
        </div>
      </div>
    );
  }
  return (
    <>
      <UserInfo user={me} />
      <VerifyEmailForm action={action} />
    </>
  );
}
export async function action() {
  'use server';
  const res = await nile.users.verifySelf({
    callbackUrl: '/verify-email',
  });

  if (res instanceof Response) {
    return { ok: false, message: await res.text() };
  }

  return {
    ok: true,
    message:
      'Check your email for instructions on how to verify your email address.',
  };
}
