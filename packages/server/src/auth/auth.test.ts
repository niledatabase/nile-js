import { Config } from '../utils/Config';

import Auth, { parseToken } from '.';

const baseConfig = [
  'api',
  'configure',
  'databaseId',
  'databaseName',
  'db',
  'debug',
  'headers',
  'logger',
  'password',
  'listProviders',
  'getSession',
  'user',
  'resetHeaders',
  'signOut',
];
const apiConfig = [
  'basePath',
  'callbackUrl',
  'cookieKey',
  'routePrefix',
  'routes',
  'headers',
  'origin',
  'secureCookies',
];
const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
  user: 'username',
  password: 'password',
};
describe('auth', () => {
  it('has expected methods', () => {
    const methods = new Auth(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});

describe('parseToken', () => {
  const createHeaders = (map: Record<string, string | undefined>) =>
    ({
      get: (key: string) => map[key.toLowerCase()],
    } as unknown as Headers);

  it('returns null if no headers are passed', () => {
    expect(parseToken()).toBeUndefined();
  });

  it('returns null if neither set-cookie nor cookie are present', () => {
    const headers = createHeaders({});
    expect(parseToken(headers)).toBeUndefined();
  });

  it('extracts token from set-cookie with Secure prefix', () => {
    const token = 'abc123';
    const headers = createHeaders({
      'set-cookie': `__Secure-nile.session-token=${token}; Path=/; Secure; HttpOnly`,
    });
    expect(parseToken(headers)).toBe(`__Secure-nile.session-token=${token}`);
  });

  it('extracts token from set-cookie without Secure prefix', () => {
    const token = 'abc123';
    const headers = createHeaders({
      'set-cookie': `nile.session-token=${token}; Path=/; HttpOnly`,
    });
    expect(parseToken(headers)).toBe(`nile.session-token=${token}`);
  });

  it('extracts correct token from multiple comma-separated set-cookie headers', () => {
    const token = 'my-token';
    const headers = createHeaders({
      'set-cookie': `some-cookie=value1; Path=/, __Secure-nile.session-token=${token}; Path=/, other-cookie=value2; Path=/`,
    });
    expect(parseToken(headers)).toBe(`__Secure-nile.session-token=${token}`);
  });

  it('extracts token from cookie header (semi-colon separated)', () => {
    const token = 'cookie-token';
    const headers = createHeaders({
      cookie: `other-cookie=foo; __Secure-nile.session-token=${token}; another=bar`,
    });
    expect(parseToken(headers)).toBe(`__Secure-nile.session-token=${token}`);
  });

  it('extracts token from cookie header without Secure prefix', () => {
    const token = 'cookie-token';
    const headers = createHeaders({
      cookie: `other-cookie=foo; nile.session-token=${token}; another=bar`,
    });
    expect(parseToken(headers)).toBe(`nile.session-token=${token}`);
  });

  it('returns null if token is not found in headers', () => {
    const headers = createHeaders({
      'set-cookie': 'some-cookie=value1; Path=/',
      cookie: 'another-cookie=value2; test=123',
    });
    expect(parseToken(headers)).toBeUndefined();
  });

  it('gives precedence to set-cookie over cookie if both present', () => {
    const secureToken = 'from-set-cookie';
    const fallbackToken = 'from-cookie';
    const headers = createHeaders({
      'set-cookie': `__Secure-nile.session-token=${secureToken}; Path=/; HttpOnly`,
      cookie: `__Secure-nile.session-token=${fallbackToken}; other=value`,
    });
    expect(parseToken(headers)).toBe(
      `__Secure-nile.session-token=${secureToken}`
    );
  });

  it('handles malformed cookie headers gracefully', () => {
    const headers = createHeaders({
      cookie: ';;;;;;;',
    });
    expect(parseToken(headers)).toBeUndefined();
  });
  it('extracts token from cookie when token is at the end of the string', () => {
    const token = 'endtoken';
    const headers = createHeaders({
      cookie: `other=value; __Secure-nile.session-token=${token}`,
    });
    expect(parseToken(headers)).toBe(`__Secure-nile.session-token=${token}`);
  });
});
