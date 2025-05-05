import {
  Nile,
  Server,
  User,
  NileConfig,
  parseToken,
  Tenant,
} from '../../src/index';

const config: NileConfig = { debug: true };

const primaryUser = {
  email: 'delete@me.com',
  password: 'deleteme',
  newTenantName: 'delete@me.com',
};

const powerCreate = {
  email: 'delete4@me.com',
  password: 'deleteme',
};

const tu = {
  email: 'delete3@me.com',
  password: 'deleteme',
};
const specificTenantId = generateUUIDv7();

describe('api integration', () => {
  const nile = Nile(config);
  it('does api calls for the api sdk', async () => {
    // debugging clean up
    await initialDebugCleanup(nile);
    // make this user for later

    const tenantUser = await nile.auth.signUp<User>(tu);
    expect(tenantUser).toMatchObject({ email: tu.email });
    // signs up a user to a tenant
    let user = await nile.auth.signUp<User>(primaryUser);
    expect(user).toMatchObject({ email: primaryUser.email });
    expect(user.tenants.length).toEqual(1);
    const me = await nile.users.getSelf();
    expect(user).toMatchObject(me);

    const user1Token = parseToken(nile.getContext().headers); // save for later

    // sign up a new user to the same tenant
    const newUser = {
      ...powerCreate,
      tenantId: user.tenants[0],
    };
    // this user was deleted
    const user2 = await nile.auth.signUp<User>(newUser);
    expect(user2).toMatchObject({ email: powerCreate.email });
    expect(user2.tenants[0]).toEqual(user.tenants[0]);
    const me2 = await nile.users.getSelf();
    expect(user2).toMatchObject(me2);

    // be sure its two unique users
    const user2Token = parseToken(nile.getContext().headers);
    expect(user1Token).not.toEqual(user2Token);

    await nile.auth.signOut();
    expect(nile.getContext().headers).toEqual(new Headers());
    const failedMe = await nile.users.getSelf(true);
    expect(failedMe.status).toEqual(401);

    // do a sign in
    const signIn = await nile.auth.signIn('credentials', powerCreate);
    expect(signIn.status).toEqual(302);
    expect(signIn.headers.get('location')).toEqual(
      'http://localhost:3000/api/auth/callback/credentials'
    );
    expect(parseToken(signIn.headers)).toEqual(
      parseToken(nile.getContext().headers)
    );

    // delete myself
    const deleted = await nile.users.removeSelf();
    expect(deleted.status).toEqual(204);
    expect((await nile.users.getSelf(true)).status).toEqual(401);

    // Updating session user
    await nile.auth.signIn('credentials', primaryUser);
    user = await nile.users.getSelf<User>();
    expect(user.name).toEqual(null);
    const update = {
      name: 'updatedName',
    };

    const updatedFirstUser = await nile.users.updateSelf(update);

    expect(updatedFirstUser).toMatchObject({
      name: update.name,
    });

    // add a tenant, be sure user is in tenant
    const newTenant = (await nile.tenants.create('betterName')) as {
      id: string;
      name: string;
    };
    expect(newTenant.name).toEqual('betterName');

    const specificTenant = await nile.tenants.create<Tenant>({
      name: 'specific',
      id: specificTenantId,
    });

    expect(specificTenant.id).toEqual(specificTenantId);

    // be sure the tenant we get is the tenant we got
    const checkTenant = await nile.tenants.get<Tenant>(newTenant.id);
    expect(checkTenant.id).toEqual(newTenant.id);

    // be sure the session user is assigned to the created tenant
    const checkMeUpdate = await nile.users.getSelf<User>();
    expect(checkMeUpdate).toMatchObject({
      tenants: expect.arrayContaining([specificTenantId, newTenant.id]),
    });

    // contextualize the remaining queries
    nile.setContext({ tenantId: newTenant.id });

    // rename tenant
    const updated = await nile.tenants.update<Tenant>({
      name: 'betterNameAgain',
    });
    expect(updated?.name).toEqual('betterNameAgain');
    // join a user to a tenant
    const newTenantUser = await nile.tenants.addMember<User>(tenantUser.id);
    expect(newTenantUser).toMatchObject({ email: tenantUser.email });

    // list users in the tenant to be sure they are updated

    expect((await nile.tenants.users<User[]>()).length).toEqual(2);

    // remove a user from the tenant
    const removed = await nile.tenants.removeMember(tenantUser.id);
    expect(removed.status).toEqual(204);

    // leave the tenant, check expected things
    await nile.tenants.leaveTenant(newTenant.id);

    const savedTenants = checkMeUpdate.tenants.filter(
      (t) => t !== newTenant.id
    );
    expect((await nile.users.getSelf<User>()).tenants).toEqual(savedTenants);

    const failedNewTenantUser = await nile.tenants.addMember(
      tenantUser.id,
      true
    );
    expect(failedNewTenantUser.status).toEqual(401);
    expect(
      (await nile.tenants.update({ name: 'what name' }, true)).status
    ).toEqual(401);
    expect((await nile.tenants.delete()).status).toEqual(401);
    expect((await nile.tenants.get(true)).status).toEqual(401);
    expect((await nile.tenants.leaveTenant()).status).toEqual(401);
    expect((await nile.tenants.users(true)).status).toEqual(401);

    await nile.db.clearConnections();
  }, 30000);
});

async function initialDebugCleanup(nile: Server) {
  // remove the users 1st, fk constraints
  await nile.db.query('delete from auth.credentials');
  await nile.db.query('delete from users.users');

  const tenants = await nile.db.query('select * from tenants;');

  for (const tenant of tenants.rows) {
    await nile.db.query('delete from users.tenant_users where tenant_id = $1', [
      tenant.id,
    ]);
    await nile.db.query('delete from public.tenants where id = $1', [
      tenant.id,
    ]);
  }
}

function generateUUIDv7(): string {
  const now = BigInt(Date.now());

  // Timestamp: 48 bits
  const timestamp = now << 16n;

  // Random bits: 74 bits (to pad rest of UUID)
  const randomBits = crypto.getRandomValues(new Uint8Array(10));
  let rand = 0n;
  for (const byte of randomBits) {
    rand = (rand << 8n) | BigInt(byte);
  }

  // Combine timestamp and random
  const uuidBigInt = timestamp | (rand & 0xffffffffffffn); // Keep lower 48 bits of rand

  // Format UUIDv7 (as per draft spec)
  const hex = uuidBigInt.toString(16).padStart(32, '0');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '7' + hex.slice(13, 16), // version 7
    ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80)
      .toString(16)
      .padStart(2, '0') + hex.slice(18, 20), // variant
    hex.slice(20, 32),
  ].join('-');
}
