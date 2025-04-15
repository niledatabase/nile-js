// Move the mock to the top
jest.mock('../context/asyncStorage', () => ({
  getCookie: jest.fn(),
  getOrigin: jest.fn(),
}));

import { getCookie, getOrigin } from '../context/asyncStorage';

import { Config } from './Config';
import { X_NILE_SECURECOOKIES } from './constants';
import { makeBasicHeaders } from './fetch';

describe('fetch wrapper', () => {
  const url = '/';
  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test
  });

  it('sets application json and uses the context', () => {
    const config = new Config();
    (getCookie as jest.Mock).mockReturnValue('nile.session-token=123');
    (getOrigin as jest.Mock).mockReturnValue('http://some.url');

    const result = Object.fromEntries(makeBasicHeaders(config, url).entries());

    expect(result).toEqual({
      'content-type': 'application/json; charset=utf-8',
      cookie: 'nile.session-token=123',
      'nile.origin': 'http://some.url',
    });
    expect(getCookie).toHaveBeenCalled();
    expect(getOrigin).toHaveBeenCalled();
  });

  it('makes the correct headers based on the config', () => {
    const config = new Config({ api: { secureCookies: true } });

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
        headers: { cookie: '__Secure.nile-token=blah' },
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
