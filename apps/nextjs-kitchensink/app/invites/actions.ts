'use server';

import { cookies } from 'next/headers';
import { Invite, User } from '@niledatabase/server';
import { revalidatePath } from 'next/cache';

import { nile } from '../api/[...nile]/nile';

type ServerResponse = {
  ok: boolean;
  message?: string;
  data?: Invite;
};

export async function resend(invite: Invite) {
  // do I need this?
  // the callback url is not there, need the SDK to pull the missing/correct callback
  const email = invite.identifier;
  await nile.tenants.invite({
    email,
    callbackUrl: `/invites/handle-invite?email=${email}`,
  });
  revalidatePath('/invites');
}

export async function deleteInvite(invite: Invite) {
  (await nile.withContext({ tenantId: invite.tenant_id })).tenants.deleteInvite(
    invite.id
  );

  revalidatePath('/invites');
}

// you can't do this with the API, because that would be a crazy thing to do... unless there are roles, in which case, it's great
// We assume you know what you're doing if you do something like this (all users can remove everyone, including themselves, lol. :sad:)
export async function removeUser(user: User) {
  // nile.tenant-id  cookie from the tenant selector - this will break in prod, so probably need a helper
  const tenantId = (await cookies()).get('nile.tenant-id')?.value;
  const { db } = await nile.withContext({ tenantId });

  await db.query('delete from users.tenant_users where user_id = $1', [
    user.id,
  ]);
  revalidatePath('/invites');
}

export async function inviteUser(
  _: unknown,
  formData: FormData
): Promise<ServerResponse> {
  'use server';

  const email = formData.get('email') as string;
  const response = await nile.tenants.invite({
    email,
    callbackUrl: `/invites/handle-invite?email=${email}`,
  });
  if (response instanceof Response) {
    return {
      ok: false,
      message: `Failed to create invite for user: ${await response.text()}`,
    };
  }

  revalidatePath('/invites');
  return { ok: true, data: response };
}

// a handler for when the tenant changes in the selector. Maybe in the future it does this automatically.
export async function setActiveTenant(tenantId: string) {
  const cooks = await cookies();
  cooks.set('nile.tenant-id', tenantId);
  revalidatePath('/invites');
}
