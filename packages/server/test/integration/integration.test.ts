import Server from '../../src/Server';

async function toJSON(body: BodyInit) {
  const resp = new Response(body);
  const error = resp.clone();
  if (resp.status < 199 || resp.status > 300) {
    throw new Error('API fetch failed');
  }
  try {
    const json = await resp.json();
    return json;
  } catch (e: unknown) {
    const message = await error.text();
    if (message) {
      throw new Error(message);
    }
    if (e && typeof e === 'object' && 'message' in e) {
      throw new Error(String(e.message));
    }
  }
}
describe.skip('api integration', () => {
  it('does a bunch of api calls', async () => {
    const nile = Server({ debug: true });
    const loginResp = await nile.api.auth.login({
      email: String(process.env.EMAIL),
      password: String(process.env.PASSWORD),
    });
    let body = await toJSON(loginResp.body);
    expect(loginResp.status).toEqual(200);
    nile.token = body.token.jwt;
    expect(nile.token).toBe(body.token.jwt);

    const me = await nile.api.users.me();
    body = await toJSON(me.body);
    expect(body.id).toEqual(process.env.USER_ID);

    const users = await nile.api.users.listTenantUsers();
    body = await toJSON(users.body);
    expect(body.length).toBeGreaterThan(0);

    const tenantProviders = await nile.api.auth.listProviders();
    expect(tenantProviders.status).toEqual(200);
    body = await toJSON(tenantProviders.body);
    expect(body).not.toBeNull();

    const tenants = await nile.api.tenants.getTenant();
    body = await toJSON(tenants.body);
    expect(body.id).toEqual(process.env.TENANT_ID);

    nile.db.query('select * from tenants');
  });
});

describe.skip('db integration', () => {
  it('queries', async () => {
    const nile = Server();
    const res = await nile.db.query('select * from tenants');
    expect(res.rowCount).toBeGreaterThan(0);
  });
});
