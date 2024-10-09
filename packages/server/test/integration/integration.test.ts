import Nile, { Server } from '../../src/Server';
import { ServerConfig } from '../../src/types';

const config: ServerConfig = {
  // debug: true,
};

/*
    const signUpUrl = new URL('http://localhost:3000/api/users');
    const signUpReq = new Request(signUpUrl, {
      method: 'POST',
      body: JSON.stringify({
        email: '123@123.com',
        password: '123@123.com',
      }),
      headers: new Headers({
        host: signUpUrl.host,
      }),
    });
    const signUpRes = await handlers.POST(signUpReq);
    console.log(signUpRes, 'user signed up?');
    */
// GET /api/auth/providers
// GET /api/auth/csrf
// POST /api/auth/callback/credentials

/*
    const meReq = new Request('http://localhost:3000/api/me', {
      headers,
    });
    const me = await handlers.GET(meReq);
  

    const apiMe = await me?.json();
    const meAgain = await nile.api.users.me(meReq);
    const otherMe = await new Response(meAgain.body).json();
    expect(otherMe).toEqual(apiMe);
    */
/*
      {
      id: '01913794-cf44-77c2-abfe-740cf1357def',
      created: '2024-08-09T18:39:44.962Z',
      updated: '2024-08-09T18:39:44.962Z',
      deleted: null,
      name: null,
      family_name: null,
      given_name: null,
      email: '123@123.com',
      picture: null,
      tenants: []
    }*/

/*
    const createTenant = new Request('http://localhost:3000/api/tenants', {
      headers,
      method: 'POST',
      body: JSON.stringify({ name: 'tenant1' }),
    });
    const createTenantRes = await handlers.POST(createTenant);
   */
// add me to tenant

// [x] create a user
// [x] update myself
// [x] create a tenant (adds me to it)
// [x] list the tenants I am in
// [x] add a new user to a tenant I am in
// [] update a tenant I am in
const tenantId = String(process.env.TENANT_ID);

const deleteUserId = String(process.env.DELETE_USER_ID);

describe.skip('api integration', () => {
  test.skip('does api calls for the handlers', async () => {
    const nile = new Server(config);
    await nile.init();
    const { handlers } = nile.api;
    await nile.api.login({
      email: String(process.env.EMAIL),
      password: String(process.env.PASSWORD),
    });

    const tenantUsersUrl = new URL(
      `http://localhost:3000/api/tenants/${tenantId}/users`
    );

    const tenantUsersReq = new Request(tenantUsersUrl, {
      headers: nile.api.headers,
    });
    const tenantUsers = await handlers.GET(tenantUsersReq);
    const tenantUsersJson = await new Response(tenantUsers?.body).json();

    const createUserInMyTenantUrl = new URL(
      `http://localhost:3000/api/tenants/${tenantId}/users`
    );

    const userInMyTenantReq = new Request(createUserInMyTenantUrl, {
      headers: nile.api.headers,
      method: 'PUT',
      body: JSON.stringify({
        id: deleteUserId,
      }),
    });
    const newUser = await handlers.GET(userInMyTenantReq);
    const newUserJson = await new Response(newUser?.body).json();
    expect(newUserJson.email).toEqual('456@456.com');

    const deleteUrl = new URL(
      `http://localhost:3000/api/tenants/${tenantId}/users/${deleteUserId}`
    );

    const deleteReq = new Request(deleteUrl, {
      headers: nile.api.headers,
      method: 'DELETE',
    });
    await handlers.DELETE(deleteReq);

    const users = await nile.api.users.listUsers(tenantUsersReq);

    expect(users).toEqual(tenantUsersJson);
  });
  test('does api calls for the api sdk', async () => {
    const nile = new Server(config);
    await nile.init();

    await nile.api.login({
      email: String(process.env.EMAIL),
      password: String(process.env.PASSWORD),
    });
    const tenants = await nile.api.tenants.listTenants();

    if (Array.isArray(tenants)) {
      nile.tenantId = tenants[0].id;
    }

    const users = await nile.api.users.listUsers();
    if (Array.isArray(users)) {
      expect(users.length).toEqual(1);
    } else {
      throw Error('no users');
    }
  });
});

describe.skip('db integration', () => {
  it('queries', async () => {
    const nile = await Nile(config);
    const res = await nile.db.query('select * from tenants');
    expect(res.rowCount).toBeGreaterThan(0);
  });
});
