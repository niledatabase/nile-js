import { RestAPI } from '../src';

describe('nile db', () => {
  it('has expected methods', () => {
    const nile = RestAPI();
    const keys = Object.keys(nile);
    expect(keys).toEqual(['config', 'users']);
    keys.shift();
    keys.forEach((k) => {
      const props = Object.getOwnPropertyNames(
        // @ts-expect-error testing
        Object.getPrototypeOf(nile[k])
      );
      if (k === 'users') {
        expect(props).toEqual([
          'constructor',
          'createTenantUser',
          'createUser',
          'getTenantUser',
          'getUser',
          'handleOIDCCallback',
          'handleTenantAuthCallback',
          'identifyDeveloper',
          'identifyUser',
          'listTenantUsers',
          'listUsers',
          'loginOIDCUser',
          'loginTenantUser',
          'loginUser',
          'updateUser',
        ]);
      }
    });
  });
});
