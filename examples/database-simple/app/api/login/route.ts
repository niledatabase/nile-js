import { api, db } from '@/nile/Server';

export async function POST(req: Request) {
  // be sure to set the header when redirecting
  const loginResp = await api.auth.login(req);
  if (loginResp && loginResp.status >= 200 && loginResp.status < 300) {
    const headers = new Headers(loginResp.headers);

    const [tenant] = await db('tenant_users')
      .withSchema('users')
      .leftJoin(
        db('tenants').withSchema('public').as('tenants'),
        'tenants.id',
        'tenant_users.tenant_id'
      );
    const { name } = tenant;
    return new Response(
      JSON.stringify({
        slug: encodeURIComponent(name.replace(' ', '-').toLowerCase()),
      }),
      { headers }
    );
  }
  return loginResp;
}
