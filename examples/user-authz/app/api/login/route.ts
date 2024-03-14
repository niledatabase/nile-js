import nile, { api, db } from '@/nile/Server';

export async function POST(req: Request) {
  // be sure to set the header when redirecting
  const loginResp = await api.auth.login(req);
  if (!(loginResp && loginResp.status >= 200 && loginResp.status < 300)) {
    return loginResp;
  }
  const body = await loginResp.json();
  if (body.errorCode) {
    return loginResp;
  }
  const headers = new Headers(loginResp.headers);
  nile.token = body.token.jwt;
  const userResponse = await api.users.me();
  const { tenants } = await userResponse.json();
  const vals = tenants?.values();
  const tenantId = vals?.next().value;
  const tenantName = await getTenantName(tenantId);
  return new Response(
    JSON.stringify({
      slug: encodeURIComponent(tenantName.replace(' ', '-').toLowerCase()),
    }),
    { headers }
  );
}

// This will be a Nile API call.
async function getTenantName(tenantId: string): Promise<string> {
  const [result] = await db('tenants')
    .select('name')
    .where('id', api.tenants.uuid.decode(tenantId));
  return result.name;
}
