/* eslint-disable @typescript-eslint/no-explicit-any */
import { URLSearchParams } from 'url';

import Authorizer from './Authorizer';
import { broadcast } from './broadcast';
import { PartialAuthorizer } from './types';

jest.mock('./broadcast', () => ({
  broadcast: { post: jest.fn() },
  now: jest.fn(),
}));
jest.mock('./logger', () => ({
  logger: () => ({ error: jest.fn() }),
}));
const mockResponse = (data: any, ok = true) => {
  const res = {
    ok,
    json: async () => data,
  };
  return {
    ...res,
    clone: () => mockResponse(data, ok),
  };
};

describe('Authorizer', () => {
  let authorizer: Authorizer;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    localStorage.clear();
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = {
      origin: 'http://localhost:3000',
      href: '',
      assign: jest.fn(),
      replace: jest.fn(),
    };

    authorizer = new Authorizer({ baseUrl: 'https://example.com' });
  });

  describe('signIn', () => {
    it('should sign in with credentials and not store session', async () => {
      const credResponse = {
        token: 'abc',
        user: { id: '1' },
        credentials: { type: 'credentials' },
      };
      const redirectUrl = 'http://someurl.com';
      fetchMock
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse({ url: redirectUrl }))
        );

      await authorizer.signIn('credentials', {
        email: 'a',
        password: 'b',
      });
      expect(broadcast.post).not.toHaveBeenCalled();
    });
    it('should sign in with credentials and store session if not redirecting', async () => {
      const credResponse = {
        credentials: { type: 'credentials' },
      };
      const fakeSession = {
        user: { id: '1' },
      };
      const redirectUrl = 'http://someurl.com';
      fetchMock
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse({ url: redirectUrl }))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(fakeSession))
        );

      const res = await authorizer.signIn('credentials', {
        email: 'a',
        password: 'b',
        redirect: false,
      });
      expect(broadcast.post).toHaveBeenCalledWith({
        data: { trigger: 'getSession' },
        event: 'session',
      });
      expect(res).toEqual({
        error: null,
        ok: true,
        status: undefined,
        url: undefined,
      });
      expect(authorizer.state.lastSync).toBeTruthy();
    });

    it('should sign in with google and sends you to the google link', async () => {
      const credResponse = {
        google: { type: 'google' },
      };
      const redirectUrl = 'http://someurl.com';
      fetchMock
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(credResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse({ url: redirectUrl }))
        );

      await authorizer.signIn('google');
      expect(window.location.href).toEqual(redirectUrl);
      expect(broadcast.post).not.toHaveBeenCalled();
    });

    it('should throw on failed sign-in', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
      await expect(authorizer.signIn('credentials', {})).rejects.toThrow();
    });
  });

  describe('signOut', () => {
    it('should clear session and broadcast sign-out', async () => {
      localStorage.setItem('nile:session', JSON.stringify({ token: 'abc' }));
      const fakeResponse = {};
      fetchMock
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(fakeResponse))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(mockResponse(fakeResponse))
        );

      await authorizer.signOut();

      expect(broadcast.post).toHaveBeenCalledWith({
        event: 'session',
        data: { trigger: 'signout' },
      });
    });
  });

  describe('signUp', () => {
    let authorizer: Authorizer;

    beforeEach(() => {
      authorizer = new Authorizer({ baseUrl: 'http://localhost' });
      jest.clearAllMocks();
      localStorage.clear();
      (global as any).URLSearchParams = URLSearchParams;
      window.location.href = 'http://localhost';
      window.location.reload = jest.fn();
      jest.spyOn(authorizer, 'initialize').mockResolvedValue(undefined as any);
      jest.spyOn(authorizer, 'getSession').mockResolvedValue(undefined as any);
    });

    const mockFetchResponse = (data: any) =>
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => data,
        clone: () => ({
          json: async () => data,
        }),
      } as Response);

    it('should sign up with basic email and password and redirect', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({ email: 'test@example.com', password: 'pass' });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/signup'),
        expect.objectContaining({
          method: 'post',
          body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
        })
      );

      expect(authorizer.initialize).toHaveBeenCalled();
      expect(authorizer.getSession).toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost');
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should set newTenantName when provided', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        newTenantName: 'Acme Inc',
      });

      // different URL Search params
      expect(fetchMock.mock.calls[0][0]).toContain('newTenantName=Acme+Inc');
    });

    it('should use createTenant=true to fallback to email as tenant name', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        createTenant: true,
      });

      expect(fetchMock.mock.calls[0][0]).toContain('newTenantName=joe%40a.com');
    });

    it('should use createTenant as string to set newTenantName', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        createTenant: 'CompanyX',
      });

      expect(fetchMock.mock.calls[0][0]).toContain('newTenantName=CompanyX');
    });

    it('should include tenantId if provided', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        tenantId: '123',
      });

      expect(fetchMock.mock.calls[0][0]).toContain('tenantId=123');
    });

    it('should use custom fetchUrl if provided', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        fetchUrl: 'http://localhost/custom-signup',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost/custom-signup',
        expect.any(Object)
      );
    });

    it('should reload if credentials are set', async () => {
      mockFetchResponse({ token: 'abc' });

      authorizer.requestInit = { credentials: 'include' };

      await authorizer.signUp({ email: 'joe@a.com', password: 'pw' });

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should not redirect if redirect: false', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        redirect: false,
      });

      expect(window.location.href).toBe('http://localhost');
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should handle auth override with baseUrl and requestInit', async () => {
      mockFetchResponse({ token: 'abc' });

      const partialAuth: PartialAuthorizer = {
        requestInit: { headers: { 'x-test': '1' } },
        state: { baseUrl: 'http://custom' },
      };

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        auth: partialAuth,
      });

      expect(authorizer.baseUrl).toBe('http://custom');
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should handle init override', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        init: { headers: { Authorization: 'Bearer xyz' } },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: { Authorization: 'Bearer xyz' },
        })
      );
    });

    it('should parse error from redirect URL', async () => {
      mockFetchResponse({ url: 'http://localhost/signup?error=Invalid' });

      const result = await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
      });

      expect(result.error).toBe('Invalid');
    });

    it('should reload if redirected URL has a hash', async () => {
      mockFetchResponse({ token: 'abc' });

      await authorizer.signUp({
        email: 'joe@a.com',
        password: 'pw',
        callbackUrl: 'http://localhost/#thanks',
      });

      expect(window.location.href).toBe('http://localhost/#thanks');
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
      authorizer.state.session = undefined;
      authorizer.state.lastSync = 0;
      authorizer.status = null;
    });

    it('should return cached session if valid and not expired', async () => {
      const mockSession = { token: 'abc' };
      authorizer.state.session = mockSession as any;
      authorizer.state.lastSync = Date.now() + 10000;

      const result = await authorizer.getSession();

      expect(result).toEqual({ loading: false });
      expect(authorizer.status).toBe(null);
    });

    it('should fetch session and sync state when not cached', async () => {
      const mockSession = { token: 'abc', user: { id: '1' } };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        clone: () => ({ ok: true }), // required if your fetch wrapper calls `.clone()`
        json: async () => mockSession,
      });

      const syncSpy = jest.spyOn(authorizer, 'sync').mockResolvedValue();

      const result = await authorizer.getSession();

      expect(fetchMock).toHaveBeenCalledWith(
        `${authorizer.apiBaseUrl}/auth/session`,
        expect.any(Object)
      );
      expect(result).toEqual({ ...mockSession, loading: false });
      expect(authorizer.state.session).toEqual(mockSession);
      expect(syncSpy).toHaveBeenCalledWith('storage');
      expect(broadcast.post).toHaveBeenCalledWith({
        event: 'session',
        data: { trigger: 'getSession' },
      });
    });

    it('should respect params like baseUrl and init', async () => {
      const mockSession = { token: 'abc', user: { id: '1' } };
      const customBaseUrl = 'http://custom';
      const customInit = { headers: { 'X-Test': '1' } };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        clone: () => ({ ok: true }),
        json: async () => mockSession,
      });

      await authorizer.getSession({ baseUrl: customBaseUrl, init: customInit });

      expect(authorizer.baseUrl).toBe(customBaseUrl);
      expect(authorizer.requestInit).toBe(customInit);
    });
  });

  describe('fetchSession', () => {
    it('should load session from the server and save it', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'abc', user: { id: 1 } }),
        clone: () => ({ ok: true }),
      });

      const session = await authorizer.getSession();
      expect(session).toEqual({
        loading: false,
        token: 'abc',
        user: { id: 1 },
      });
    });
  });

  describe('fetchCsrf', () => {
    it('should fetch a CSRF token', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: '1234' }),
        clone: () => ({ ok: true }),
      });

      const token = await authorizer.getCsrfToken();
      expect(token).toBe('1234');
    });

    it('should throw if the CSRF token cannot be fetched', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });
      await expect(authorizer.getCsrfToken()).rejects.toThrow();
    });
  });

  describe('fetchProviders', () => {
    it('should fetch available providers', async () => {
      const providers = { google: {}, github: {} };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => providers,
        clone: () => ({ ok: true }),
      });

      const result = await authorizer.getProviders();
      expect(result).toEqual(providers);
    });
  });

  describe('resetPassword', () => {
    it('should call all reset password endpoints in non-redirect mode', async () => {
      fetchMock
        .mockResolvedValueOnce(
          mockResponse({
            url: 'https://example.com/api/auth/reset-password',
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            ok: true,
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            ok: true,
          })
        );

      await expect(
        authorizer.resetPassword({
          email: 'user@example.com',
          password: '123',
          redirect: false,
          fetchUrl: 'https://example.com/api/auth/reset-password',
        })
      ).resolves.not.toThrow();

      expect(fetchMock).toHaveBeenCalledTimes(3);

      expect(fetchMock.mock.calls[0][0]).toContain('/reset-password?json=true');
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'post',
        body: JSON.stringify({
          email: 'user@example.com',
          password: '123',
          redirectUrl: 'https://example.com/api/auth/reset-password',
          callbackUrl: '/',
        }),
      });

      expect(fetchMock.mock.calls[1][0]).toContain('/reset-password');
      expect(fetchMock.mock.calls[2][1]).toMatchObject({
        method: 'put',
        body: JSON.stringify({
          email: 'user@example.com',
          password: '123',
        }),
      });
    });
    it('should call only the initial reset-password endpoint for redirect=true', async () => {
      fetchMock.mockResolvedValueOnce(
        mockResponse({
          ok: true,
          clone: () => ({
            text: () => Promise.resolve('OK'),
          }),
        })
      );

      await expect(
        authorizer.resetPassword({
          email: 'user@example.com',
          password: '123',
          fetchUrl: 'https://example.com/api/auth/reset-password',
        })
      ).resolves.not.toThrow();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://example.com/api/auth/reset-password'
      );
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'post',
        body: JSON.stringify({
          email: 'user@example.com',
          password: '123',
          redirectUrl: 'https://example.com/api/auth/reset-password',
          callbackUrl: '/',
        }),
      });
    });
  });
});
