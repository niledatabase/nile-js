import { Nile } from './index';

const apiUrl = 'https://a.example.test/v2/databases/database';
const tenantA = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const tenantB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function createInstance(url = apiUrl, cookie?: string) {
  return Nile({
    apiUrl: url,
    databaseId: 'database',
    databaseName: 'database',
    user: 'login',
    oauthBearerToken: async () => 'database-token',
    db: { host: 'localhost', ssl: { rejectUnauthorized: true } },
    headers: cookie ? new Headers({ cookie }) : undefined,
  });
}

describe('independent Nile session context', () => {
  let requests: Array<{ url: string; cookie: string | null }>;
  let csrfSetsCookie: boolean;

  beforeEach(() => {
    requests = [];
    csrfSetsCookie = true;
    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      requests.push({ url, cookie: new Headers(init?.headers).get('cookie') });
      const path = new URL(url).pathname;
      let body: object = { id: 'user-a' };
      const headers = new Headers();
      if (path.endsWith('/auth/providers')) {
        body = { credentials: { callbackUrl: 'https://app.example.test' } };
      } else if (path.endsWith('/auth/csrf')) {
        body = { csrfToken: 'csrf-a' };
        if (csrfSetsCookie) {
          headers.set(
            'set-cookie',
            'nile.csrf-token=csrf-a; nile.session-token=csrf-session-a'
          );
        }
      } else if (path.endsWith('/auth/callback/credentials')) {
        headers.set('set-cookie', 'nile.session-token=signed-in-a');
      } else if (path.endsWith('/signup')) {
        body = { id: 'user-a', tenants: [tenantA] };
        headers.set('set-cookie', 'nile.session-token=signed-up-a');
      } else if (path.endsWith('/auth/reset-password')) {
        if (init?.method === 'POST') {
          body = {
            url: 'https://app.example.test/api/auth/reset-password?token=reset-a',
          };
        } else if (init?.method === 'PUT') {
          headers.set('set-cookie', 'nile.session-token=reset-session-a');
        } else {
          headers.set('set-cookie', 'nile.reset=reset-a');
        }
      }
      return new Response(JSON.stringify(body), { headers });
    });
  });

  afterEach(() => jest.restoreAllMocks());

  describe.each([
    ['same database', apiUrl],
    ['different API origin', 'https://b.example.test/v2/databases/other'],
  ])('%s', (_name, otherUrl) => {
    it.each([
      ['csrf', 'csrf-session-a'],
      ['raw csrf', 'csrf-session-a'],
      ['cached csrf', 'session-a'],
      ['sign in', 'signed-in-a'],
      ['sign up', 'signed-up-a'],
      ['sign out', null],
      ['remove self', null],
      ['reset password', 'reset-session-a'],
    ])(
      'keeps %s updates in the initiating instance',
      async (action, session) => {
        const first = createInstance(
          apiUrl,
          'nile.session-token=session-a; nile.csrf-token=cached-csrf-a'
        );
        const second = createInstance(otherUrl, 'nile.session-token=session-b');
        await second.withContext({ tenantId: tenantB, userId: 'user-b' });
        await second.users.getSelf();
        expect(requests.at(-1)).toEqual({
          url: `${otherUrl}/me`,
          cookie: 'nile.session-token=session-b',
        });

        switch (action) {
          case 'csrf':
            await first.auth.getCsrf();
            break;
          case 'raw csrf':
            await first.auth.getCsrf(true);
            break;
          case 'cached csrf':
            csrfSetsCookie = false;
            await first.auth.getCsrf();
            break;
          case 'sign in':
            await first.auth.signIn('credentials', {
              email: 'a@example.test',
              password: 'password-a',
            });
            break;
          case 'sign up':
            await first.auth.signUp({
              email: 'a@example.test',
              password: 'password-a',
            });
            break;
          case 'sign out':
            await first.auth.signOut();
            break;
          case 'remove self':
            await first.users.removeSelf();
            break;
          case 'reset password':
            await first.auth.resetPassword({
              email: 'a@example.test',
              password: 'new-password-a',
            });
            break;
        }

        const savedCookie = first.getContext().headers.get('cookie');
        if (session) {
          expect(savedCookie).toContain(`nile.session-token=${session}`);
        } else {
          expect(savedCookie).toBeNull();
        }
        if (action === 'sign up') {
          expect(first.getContext().tenantId).toBe(tenantA);
        }
        expect(second.getContext()).toMatchObject({
          tenantId: tenantB,
          userId: 'user-b',
        });

        await first.users.getSelf();
        if (session) {
          expect(requests.at(-1)?.cookie).toContain(
            `nile.session-token=${session}`
          );
        } else {
          expect(requests.at(-1)?.cookie).toBeNull();
        }
        if (action === 'sign up') {
          await first.tenants.get();
          expect(requests.at(-1)?.url).toBe(`${apiUrl}/tenants/${tenantA}`);
        }

        await second.users.getSelf();
        expect(requests.at(-1)).toEqual({
          url: `${otherUrl}/me`,
          cookie: 'nile.session-token=session-b',
        });
        expect(second.getContext()).toMatchObject({
          tenantId: tenantB,
          userId: 'user-b',
        });
        await second.tenants.get();
        expect(requests.at(-1)?.url).toBe(`${otherUrl}/tenants/${tenantB}`);
      }
    );
  });

  it('keeps each instance last context after interleaved withContext calls', async () => {
    const first = createInstance(apiUrl, 'nile.session-token=session-a');
    const second = createInstance(apiUrl, 'nile.session-token=session-b');
    await first.withContext({ tenantId: 'tenant-a', userId: 'user-a' });
    await second.withContext({ tenantId: 'tenant-b', userId: 'user-b' });
    expect(first.getContext()).toMatchObject({
      tenantId: 'tenant-a',
      userId: 'user-a',
    });
    expect(first.getContext().headers.get('cookie')).toBe(
      'nile.session-token=session-a'
    );
    expect(second.getContext()).toMatchObject({
      tenantId: 'tenant-b',
      userId: 'user-b',
    });
  });

  it('uses the callback instance session when called inside another instance context', async () => {
    const first = createInstance(apiUrl, 'nile.session-token=session-a');
    const otherUrl = 'https://b.example.test/v2/databases/other';
    const second = createInstance(otherUrl, 'nile.session-token=session-b');
    await first.withContext(async () => {
      await second.auth.callback(
        'credentials',
        JSON.stringify({ email: 'b@example.test', password: 'password-b' })
      );
      expect(requests.at(-1)).toEqual({
        url: `${otherUrl}/auth/callback/credentials`,
        cookie: 'nile.session-token=session-b',
      });
    });
  });

  it('does not inherit another instance cookie through a nested request', async () => {
    const first = createInstance(apiUrl, 'nile.session-token=session-a');
    const second = createInstance('https://b.example.test/v2/databases/other');
    await first.withContext(
      { tenantId: 'tenant-a', userId: 'user-a' },
      async () => {
        await second.users.getSelf();
        expect(requests.at(-1)).toEqual({
          url: 'https://b.example.test/v2/databases/other/me',
          cookie: null,
        });
        expect(first.getContext()).toMatchObject({
          tenantId: 'tenant-a',
          userId: 'user-a',
        });
        await first.users.getSelf();
        expect(requests.at(-1)?.cookie).toBe('nile.session-token=session-a');
      }
    );
  });
});
