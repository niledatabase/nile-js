import { User } from '@niledatabase/server';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

import { nile } from '@/app/api/[...nile]/nile';

export async function GET(req: NextRequest) {
  // you may have already been logged in, so we need to check
  const me = await nile.users.getSelf<Response | User>();
  if (me instanceof Response) {
    // its a 404/401, which means the user needs to sign up before they can do any thing
    return redirect('/invites/sign-up');
  }
  // we need to be sure the identifier matches the user. If not, we need to give them the option to switch users.
  const email = req.nextUrl.searchParams.get('email');
  if (email !== me.email) {
    return redirect('/invites/user-switcher');
  }
  return redirect('/invites');
}
