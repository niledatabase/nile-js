import { NextRequest } from 'next/server';
import { Server } from '@niledatabase/server';

import { handlers } from '../../../[...nile]/nile';

export async function GET(req: NextRequest) {
  const { response, nile } = await handlers.withContext.GET(req);
  const me = await nile.users.getSelf();

  if (me instanceof Response) {
    // something went wrong with the cookie or oauth handshake
    return handleFailure(nile, response);
  }
  // add user to tenant - this is a terrible place to do this
  await nile.noContext(async ({ db }) => {
    await db.query(`CREATE TABLE IF NOT EXISTS "todos2" (
    "id" uuid DEFAULT gen_random_uuid(),
    "tenant_id" uuid,
    "title" varchar(256),
    "complete" boolean,
    CONSTRAINT todos2_tenant_id_id PRIMARY KEY("tenant_id","id")
  );`);
  });

  let tenantId = me.tenants[0];
  if (!tenantId) {
    const tenant = await nile.tenants.create(me.email);
    if (tenant instanceof Response) {
      // something went wrong with the cookie
      return handleFailure(nile, response);
    }
    tenantId = tenant.id;
  }

  await nile.db.query(
    "insert into todos2 (title, complete, tenant_id) values ('a title', false, $1)",
    [tenantId]
  );

  // return all the cookies to the client
  return response;
}

async function handleFailure(nile: Server, response: Response) {
  const signOutRes = await nile.auth.signOut();
  // pass along the cookie invalidation headers, but also redirect
  const newHeaders = new Headers(signOutRes.headers);
  newHeaders.set('location', '/');

  const ssoClearingHeaders = response?.headers.get('set-cookie');
  if (ssoClearingHeaders) {
    newHeaders.set('set-cookie', ssoClearingHeaders);
  }

  return new Response(null, {
    status: 302,
    headers: newHeaders,
  });
}
