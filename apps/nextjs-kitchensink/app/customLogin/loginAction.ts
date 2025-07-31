'use server';
import { User } from '@niledatabase/server';

import { nile } from '../api/[...nile]/nile';

export type LoginResponse = {
  message?: string;
  user?: User;
};
export async function login(
  prevState: LoginResponse | null,
  formData: FormData
): Promise<LoginResponse> {
  const email = formData.get('email');
  const password = formData.get('password');
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    throw new Error('Email and password are required');
  }

  await nile.auth.signIn(
    'credentials',
    {
      email,
      password,
    },
    true
  );

  const user = await nile.users.getSelf();

  if (!user || user instanceof Response) {
    return {
      message: "User not found. It's probably because you're not authenticated",
    };
  }

  return { user };
}
