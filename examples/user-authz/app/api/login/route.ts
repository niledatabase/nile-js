import nile, { api, db } from '@/nile/Server';

export async function POST(req: Request) {
  // be sure to set the header when redirecting
  const loginResp = await api.auth.login(req);
  if (loginResp && loginResp.status >= 200 && loginResp.status < 300) {
    const headers = new Headers(loginResp.headers);
    const body = await new Response(loginResp.body).json();
    try {
      nile.token = body.token.jwt;
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
        const tenantId = vals?.next().value;
        const tenantName = await getTenantName(tenantId);
        return new Response(
          JSON.stringify({
            slug: encodeURIComponent(
              tenantName.replace(' ', '-').toLowerCase()
            ),
          }),
          { headers }
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
  return loginResp;
}

// This will be a Nile API call.
async function getTenantName(tenantId: string): Promise<string> {
  const [result] = await db('tenants').select('name').where('id', api.tenants.uuid.decode(tenantId));
  return result.name;
}
