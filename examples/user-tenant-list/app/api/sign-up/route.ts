import { cookies } from 'next/headers';

import nile, { api } from '@/nile/Server';

/**
 * A basic login + signup, for easy of usage/trying out
 * If a token has already been issued, try to use it to log in.
 * ** note: this will break if you want to log in as 2 different users.
 * @param req Request
 * @returns  new Response
 */
export async function POST(req: Request) {
  const existing = cookies().get('token');
  // if you have a token set, check if you can get that user and redirect.
  if (existing) {
    nile.token = existing?.value;
    const userResponse = await api.users.me();
    if (userResponse.status === 401) {
      return new Response(
        'Token not valid for user, remove your token and try again',
        { status: 401 }
      );
    }
    if (userResponse.status < 300) {
      const { tenants } = await userResponse.json();
      const vals = tenants?.values();
      const tenantId = vals?.next();
      return new Response(JSON.stringify({ tenantId: tenantId?.value }), {
        status: 200,
      });
    }
  }

  const body = await req.json();
  // do sign up and login all at once
  const signUpResponse = await api.auth.signUp(body);

  if (signUpResponse.status === 500) {
    return new Response('A REST error occured. Try again later', {
      status: 500,
    });
  }

  if (signUpResponse.status > 300) {
    return new Response('User already signed up, create a new user', {
      status: 400,
    });
  }

  const token = await signUpResponse.json();

  // implement cookie logic so the user to make requests from the browser
  const headers = new Headers();
  const cookie = `token=${token.token.jwt}; path=/; samesite=lax; httponly;`;
  headers.set('set-cookie', cookie);

  // set the api token
  nile.token = token.token.jwt;

  // by default, a user does not belong to a tenant.
  // This creates a tenant with the same name, and adds them to it.
  const createTenantResponse = await api.tenants.createTenant({
    name: body.email,
  });
  const tenant = await createTenantResponse.json();

  // set the tenant id
  nile.tenantId = tenant.id;
  await api.users.createTenantUser(body);

  return new Response(JSON.stringify({ tenantId: tenant.id }), {
    status: 200,
    headers,
  });
}
