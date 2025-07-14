import { UserInfo } from '@niledatabase/react';
import { User } from '@niledatabase/server';

import { nile } from '../api/[...nile]/nile';

import { PasswordResetForm } from './resetForm';

type ServerResponse = {
  ok: boolean;
  message?: string;
};

export default async function ResetPasswordServer() {
  const me = await nile.users.getSelf<User | Response>();

  if (me instanceof Response) {
    return null;
  }
  async function resetPassword(
    _: unknown,
    formData: FormData
  ): Promise<ServerResponse> {
    'use server';

    const password = formData.get('password') as string;
    if (me instanceof Response) {
      return { ok: false, message: 'You are not logged in.' };
    }
    const response = await nile.auth.resetPassword({
      email: me.email,
      password,
    });

    if (response.ok) {
      return { ok: true, message: 'Password reset' };
    }

    const message = await response.text();
    return { ok: false, message };
  }

  return (
    <div className="w-2xl mx-auto p-10">
      <UserInfo user={me} />
      <PasswordResetForm action={resetPassword} />
    </div>
  );
}
