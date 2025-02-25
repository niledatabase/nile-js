import { Config } from './Config';
import { X_NILE_SECURECOOKIES } from './constants';
import { makeBasicHeaders } from './fetch';

describe('fetch wrapper', () => {
  it('sets application json', () => {
    const config = new Config();
    expect(Object.fromEntries(makeBasicHeaders(config).entries())).toEqual({
      'content-type': 'application/json; charset=utf-8',
    });
  });
  it('makes the correct headers based on the config', () => {
    const config = new Config({ secureCookies: true });
    expect(Object.fromEntries(makeBasicHeaders(config).entries())).toEqual({
      'content-type': 'application/json; charset=utf-8',
      [X_NILE_SECURECOOKIES]: 'true',
    });
  });
  it('passes headers on', () => {
    const config = new Config({ secureCookies: true });
    expect(
      Object.fromEntries(
        makeBasicHeaders(config, {
          headers: { cookie: '__Secure.nile-token=blah' },
        }).entries()
      )
    ).toEqual({
      'content-type': 'application/json; charset=utf-8',
      cookie: '__Secure.nile-token=blah',
      [X_NILE_SECURECOOKIES]: 'true',
    });
  });
});
