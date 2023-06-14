import { Client as RestAPI } from '../src';

describe('nile db', () => {
  it('has expected methods', () => {
    const nile = new RestAPI({});
    const keys = Object.keys(nile);
    expect(keys).toEqual(['auth', 'users']);
    keys.forEach((k) => {
      const props = Object.getOwnPropertyNames(
        // @ts-expect-error testing
        Object.getPrototypeOf(nile[k])
      );
      if (k === 'auth') {
        expect(props).toEqual([
          'constructor',
          'loginRaw',
          'login',
          'signUpRaw',
          'signUp',
        ]);
      }
      if (k === 'users') {
        expect(props).toEqual([
          'constructor',
          'createTenantUserRaw',
          'createTenantUser',
          'identifyUserRaw',
          'identifyUser',
          'listTenantUsersRaw',
          'listTenantUsers',
        ]);
      }
    });
  });
});
