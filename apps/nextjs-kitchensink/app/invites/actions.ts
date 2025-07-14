'use server';

import { cookies, headers } from 'next/headers';
import { Invite, User } from '@niledatabase/server';
import { revalidatePath } from 'next/cache';

import { nile } from '../api/[...nile]/nile';

type ServerResponse = {
  ok: boolean;
  message?: string;
  data?: Invite;
};

export async function resend(invite: Invite) {
  nile.setContext(await headers());
  nile.setContext({ tenantId: invite.tenant_id });
  await nile.tenants.invite(invite.identifier);
  revalidatePath('/invites');
}

export async function deleteInvite(invite: Invite) {
  nile.setContext(await headers());
  nile.setContext({ tenantId: invite.tenant_id });

  await nile.tenants.deleteInvite(invite.id);
  revalidatePath('/invites');
}

// you can't do this with the API, because that would be a crazy thing to do... unless there are roles, in which case, its great
// We assume you know what you're doing if you do something like this (all users can remove everyone, including themselves, lol. :sad:)
export async function removeUser(user: User) {
  // nile.tenant-id  cookie from the tenant selector
  const tenantId = (await cookies()).get('nile.tenant-id')?.value;
  nile.setContext({ tenantId });

  await nile.db.query('delete from users.tenant_users where user_id = $1', [
    user.id,
  ]);
  revalidatePath('/invites');
}

export async function inviteUser(
  _: unknown,
  formData: FormData
): Promise<ServerResponse> {
  'use server';

  nile.setContext(await headers());
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
  nile.setContext({ tenantId });
  cooks.set('nile.tenant-id', tenantId);
  revalidatePath('/invites');
}
