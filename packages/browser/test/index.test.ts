import Browser from '../src';

describe('nile db', () => {
  it('has expected methods', () => {
    const nile = new Browser({});
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
          'createProvider',
          'getSSOProviders',
          'login',
          'signUp',
          'updateProvider',
        ]);
      }
      if (k === 'users') {
        expect(props).toEqual([
          'constructor',
          'createTenantUser',
          'identifyUser',
          'listTenantUsers',
          'listUsers',
          'updateUser',
        ]);
      }
    });
  });
});
