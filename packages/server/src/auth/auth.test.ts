import { fetchCallback } from '../api/routes/auth/callback';
import { fetchCsrf } from '../api/routes/auth/csrf';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { Config } from '../utils/Config';

import Auth, { parseCSRF, parseCallback, parseToken } from '.';

jest.mock('../api/routes/auth/callback');
jest.mock('../api/routes/auth/csrf');
jest.mock('../api/routes/auth/providers');
jest.mock('../api/routes/auth/session');
jest.mock('../api/routes/auth/signout');
jest.mock('../api/routes/signup');
jest.mock('../utils/Logger', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
    })),
    LogReturn: jest.fn(),
  };
});

describe('Auth Class', () => {
  let authInstance: Auth;

  beforeEach(() => {
    authInstance = new Auth(new Config({}));
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('getSession - returns correct session data', async () => {
    const mockSessionResponse = { user: 'testUser' };
    (fetchSession as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSessionResponse),
    });

    const result = await authInstance.getSession();

    expect(result).toEqual(mockSessionResponse);
    expect(fetchSession).toHaveBeenCalled();
  });

  it('getSession - handles raw response correctly', async () => {
    const mockResponse = new Response('response body');
    (fetchSession as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authInstance.getSession(true);

    expect(result).toBe(mockResponse);
    expect(fetchSession).toHaveBeenCalled();
  });

  it('getCsrf - returns correct CSRF data', async () => {
    const mockCsrfResponse = { csrfToken: 'token' };
    const mockFetchResponse = {
      headers: new Headers({ 'set-cookie': 'nile.csrf-token=token' }),
      json: jest.fn().mockResolvedValue({ csrfToken: 'token' }),
    };
    (fetchCsrf as jest.Mock).mockResolvedValue(mockFetchResponse);

    const result = await authInstance.getCsrf();

    expect(result).toEqual(mockCsrfResponse);
    expect(fetchCsrf).toHaveBeenCalled();
    expect(authInstance.headers?.get('cookie')).toContain(
      'nile.csrf-token=token'
    );
  });

  it('listProviders - returns list of providers', async () => {
    const mockProviders = { credentials: { callbackUrl: 'http://localhost' } };
    (fetchProviders as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockProviders),
    });

    const result = await authInstance.listProviders();
    expect(result).toEqual(mockProviders);
    expect(fetchProviders).toHaveBeenCalled();
  });

  it('signOut - successfully signs out', async () => {
    const mockCsrfResponse = { csrfToken: 'csrf-token' };
    const mockSignOutResponse = new Response(null, { status: 200 });
    (fetchCsrf as jest.Mock).mockResolvedValue(mockCsrfResponse);
    (fetchSignOut as jest.Mock).mockResolvedValue(mockSignOutResponse);

    const result = await authInstance.signOut();

    expect(result).toBe(mockSignOutResponse);
    expect(fetchCsrf).toHaveBeenCalled();
    expect(fetchSignOut).toHaveBeenCalledWith(authInstance, expect.anything());
  });

  it('signUp - successfully signs up a user', async () => {
    const mockProviders = { credentials: { callbackUrl: 'http://localhost' } };
    const mockCsrfResponse = { csrfToken: 'csrf-token' };
    const mockSignUpResponse = new Response(null, {
      status: 200,
      headers: {
        'set-cookie': 'nile.session-token=fake',
      },
    });
    (fetchProviders as jest.Mock).mockResolvedValue(mockProviders);
    (fetchCsrf as jest.Mock).mockResolvedValue(mockCsrfResponse);
    (fetchSignUp as jest.Mock).mockResolvedValue(mockSignUpResponse);

    await authInstance.signUp({ email: 'test@test.com', password: 'password' });

    expect(fetchSignUp).toHaveBeenCalledWith(
      authInstance,
      'credentials',
      expect.anything()
    );
  });

  it('signIn - successfully signs in a user', async () => {
    const mockProviders = { credentials: { callbackUrl: 'http://localhost' } };
    const mockCsrfResponse = { csrfToken: 'csrf-token' };
    const authCookie = 'session-token';
    const locationHeader = 'http://localhost/dashboard';

    const resolvedHeaders = new Headers({
      'set-cookie': `nile.session-token=${authCookie}`,
      location: locationHeader,
    });

    (fetchProviders as jest.Mock).mockResolvedValue(mockProviders);
    (fetchCsrf as jest.Mock).mockResolvedValue(mockCsrfResponse);
    (fetchCallback as jest.Mock).mockResolvedValue({
      headers: resolvedHeaders,
    });

    const result = await authInstance.signIn(
      { email: 'test@test.com', password: 'password' },
      { returnResponse: true }
    );

    expect(result).toEqual([new Headers({}), { headers: resolvedHeaders }]);
    expect(fetchCallback).toHaveBeenCalledWith(
      authInstance,
      'credentials',
      expect.anything()
    );
  });

  it('parseCSRF - correctly extracts csrf token from cookie', () => {
    const mockHeaders = new Headers({
      'set-cookie': 'nile.csrf-token=token; Path=/; HttpOnly; SameSite=Lax',
    });
    const token = parseCSRF(mockHeaders);
    expect(token).toBe('nile.csrf-token=token');
  });

  it('parseCallback - correctly extracts callback url from cookie', () => {
    const mockHeaders = new Headers({
      'set-cookie':
        'nile.callback-url=http://localhost/callback; Path=/; HttpOnly; SameSite=Lax',
    });
    const token = parseCallback(mockHeaders);
    expect(token).toBe('nile.callback-url=http://localhost/callback');
  });

  it('parseToken - correctly extracts session token from cookie', () => {
    const mockHeaders = new Headers({
      'set-cookie':
        'nile.session-token=token123; Path=/; HttpOnly; SameSite=Lax',
    });
    const token = parseToken(mockHeaders);
    expect(token).toBe('nile.session-token=token123');
  });
});
