import { Config } from '../utils/Config';

/**
 * a helper function to log in server side.
 */
export default function serverAuth(
  config: Config,
  handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
  }
) {
  return async function login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const sessionUrl = new URL(`${config.api.localPath}/api/auth/providers`);
    const sessionReq = new Request(sessionUrl, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const sessionRes = await handlers.POST(sessionReq);
    const providers = await sessionRes?.json();

    const csrf = new URL(`${config.api.localPath}/api/auth/csrf`);
    const csrfReq = new Request(csrf, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const csrfRes = await handlers.POST(csrfReq);

    const { csrfToken } = (await csrfRes?.json()) ?? {};
    const { credentials } = providers;

    const csrfCookie = csrfRes?.headers.get('set-cookie');
    expect(csrfCookie).toContain('nile.csrf-token=');

    const signInUrl = new URL(credentials.callbackUrl);

    if (!csrfCookie) {
      throw new Error('unable to authenticate REST');
    }
    const postReq = new Request(signInUrl, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        cookie: csrfCookie,
      }),
      body: JSON.stringify({
        email,
        password,
        csrfToken,
        callbackUrl: credentials.callbackUrl,
      }),
    });
    const loginRes = await handlers.POST(postReq);
    const authCookie = loginRes?.headers.get('set-cookie');
    if (!authCookie) {
      throw new Error('authentication failed');
    }
    expect(authCookie).toContain('nile.session-token=');
    const [, token] = /(nile\.session-token=.+?);/.exec(authCookie) ?? [];
    return new Headers({
      cookie: [token, csrfCookie].join('; '),
    });
  };
}
