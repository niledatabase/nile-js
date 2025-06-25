import Auth, { parseCallback, parseCSRF, parseToken } from '../auth';
import { fetchCallback } from '../api/routes/auth/callback';
import { fetchCsrf } from '../api/routes/auth/csrf';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { updateHeaders } from '../utils/Event';
import { Config } from '../utils/Config';

jest.mock('../api/routes/auth/callback');
jest.mock('../api/routes/auth/csrf');
jest.mock('../api/routes/auth/providers');
jest.mock('../api/routes/auth/session');
jest.mock('../api/routes/auth/signin');
jest.mock('../api/routes/auth/signout');
jest.mock('../api/routes/signup');
jest.mock('../utils/Event');
jest.mock('../utils/Logger', () => ({
  __esModule: true,
  default: jest.fn(() => () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const mockHeaders = new Headers();
mockHeaders.set(
  'set-cookie',
  '__Secure-nile.csrf-token=abc; __Secure-nile.callback-url=/cb; __Secure-nile.session-token=token123'
);

const mockConfig = {
  headers: new Headers(),
};

describe('Auth', () => {
  let auth: Auth;

  beforeEach(() => {
    auth = new Auth(new Config(mockConfig));
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('returns parsed session json', async () => {
      const session = { user: 'bob' };
      (fetchSession as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(session))
      );
      await expect(auth.getSession()).resolves.toEqual(session);
    });

    it('returns undefined for empty session', async () => {
      (fetchSession as jest.Mock).mockResolvedValue(new Response('{}'));
      await expect(auth.getSession()).resolves.toBeUndefined();
    });

    it('returns raw response on failure to parse', async () => {
      (fetchSession as jest.Mock).mockResolvedValue(new Response('broken'));
      const res = await auth.getSession();
      expect(res).toBeInstanceOf(Response);
    });
  });

  describe('getCsrf', () => {
    it('sets cookies and returns csrf JSON', async () => {
      (fetchCsrf as jest.Mock).mockResolvedValue(
        new Response('{"csrfToken":"abc"}', { headers: mockHeaders })
      );
      const result = await auth.getCsrf();
      expect(result).toEqual({ csrfToken: 'abc' });
      expect(updateHeaders).toHaveBeenCalled();
    });

    it('returns raw response if specified', async () => {
      const response = new Response('{}', { headers: mockHeaders });
      (fetchCsrf as jest.Mock).mockResolvedValue(response);
      const result = await auth.getCsrf(true);
      expect(result).toBe(response);
    });
  });

  describe('listProviders', () => {
    it('returns parsed provider list', async () => {
      const data = { credentials: { id: 'creds' } };
      (fetchProviders as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(data))
      );
      await expect(auth.listProviders()).resolves.toEqual(data);
    });
  });

  describe('signOut', () => {
    it('calls getCsrf and fetchSignOut, clears headers', async () => {
      (fetchCsrf as jest.Mock).mockResolvedValue(
        new Response('{"csrfToken":"abc"}')
      );
      (fetchSignOut as jest.Mock).mockResolvedValue(
        new Response('{"url":"/bye"}')
      );

      await auth.signOut();
      expect(updateHeaders).toHaveBeenCalledWith(new Headers({}));
    });
  });

  describe('signUp', () => {
    it('signs up with email/password and sets token', async () => {
      (fetchProviders as jest.Mock).mockResolvedValue(
        new Response('{"credentials":{"callbackUrl":"/cb"}}')
      );
      (fetchCsrf as jest.Mock).mockResolvedValue(
        new Response('{"csrfToken":"abc"}')
      );
      (fetchSignUp as jest.Mock).mockResolvedValue(
        new Response('{"id":"user123"}', { headers: mockHeaders })
      );

      const result = await auth.signUp({ email: 'a@b.com', password: 'pass' });
      expect(result).toEqual({ id: 'user123' });
    });

    it('returns undefined if status > 299', async () => {
      (fetchProviders as jest.Mock).mockResolvedValue(
        new Response('{"credentials":{"callbackUrl":"/cb"}}')
      );
      (fetchCsrf as jest.Mock).mockResolvedValue(
        new Response('{"csrfToken":"abc"}')
      );
      (fetchSignUp as jest.Mock).mockResolvedValue(
        new Response('test error', { status: 400, headers: mockHeaders })
      );

      const result = await auth.signUp({ email: 'a@b.com', password: 'pass' });
      expect(result).toBeUndefined();
    });
  });

  describe('signIn', () => {
    it('performs credentials signIn and updates headers', async () => {
      (fetchProviders as jest.Mock).mockResolvedValue(
        new Response('{"credentials":{"callbackUrl":"/cb"}}')
      );
      (fetchCsrf as jest.Mock).mockResolvedValue(
        new Response('{"csrfToken":"abc"}')
      );
      (fetchCallback as jest.Mock).mockResolvedValue(
        new Response('{"user":"ok"}', { headers: mockHeaders })
      );

      const result = await auth.signIn('credentials', {
        email: 'a@b.com',
        password: '1234',
      });
      expect(result).toEqual({ user: 'ok' });
      expect(updateHeaders).toHaveBeenCalled();
    });
  });

  describe('parsers', () => {
    it('parses CSRF from headers', () => {
      expect(parseCSRF(mockHeaders)).toEqual('__Secure-nile.csrf-token=abc');
    });

    it('parses callback from headers', () => {
      expect(parseCallback(mockHeaders)).toEqual(
        '__Secure-nile.callback-url=/cb'
      );
    });

    it('parses session token from headers', () => {
      expect(parseToken(mockHeaders)).toEqual(
        '__Secure-nile.session-token=token123'
      );
    });
  });
});
