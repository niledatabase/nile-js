// Move the mock to the top

import { Config } from './Config';
import { X_NILE_SECURECOOKIES } from './constants';
import { makeBasicHeaders } from './fetch';

describe('fetch wrapper', () => {
  const url = '/';
  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test
  });

  it('sets application json and uses the context', () => {
    const config = new Config({
      api: {
        headers: {
          cookie: 'nile.session-token=123',
          'nile.origin': 'http://some.url',
        },
      },
    });

    const result = Object.fromEntries(makeBasicHeaders(config, url).entries());

    expect(result).toEqual({
      'content-type': 'application/json; charset=utf-8',
      cookie: 'nile.session-token=123',
      'nile.origin': 'http://some.url',
    });
  });

  it('makes the correct headers based on the config', () => {
    const config = new Config({
      api: {
        secureCookies: true,
        headers: {
          cookie: 'nile.session-token=123',
          'nile.origin': 'http://some.url',
        },
      },
    });

    const result = Object.fromEntries(makeBasicHeaders(config, url).entries());

    expect(result).toEqual({
      'content-type': 'application/json; charset=utf-8',
      cookie: 'nile.session-token=123',
      'nile.origin': 'http://some.url',
      [X_NILE_SECURECOOKIES]: 'true',
    });
  });

  it('passes the header cookie', () => {
    const config = new Config({ api: { secureCookies: true } });

    const result = Object.fromEntries(
      makeBasicHeaders(config, url, {
        headers: {
          cookie: '__Secure.nile-token=blah',
          'nile.origin': 'http://some.url',
        },
      }).entries()
    );

    expect(result).toEqual({
      'content-type': 'application/json; charset=utf-8',
      cookie: '__Secure.nile-token=blah',
      'nile.origin': 'http://some.url',
      [X_NILE_SECURECOOKIES]: 'true',
    });
  });
});
