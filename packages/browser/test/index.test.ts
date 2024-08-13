import Browser from '../src';

describe('nile db', () => {
  it('has expected methods', () => {
    const nile = new Browser({});
    const keys = Object.keys(nile);
    expect(keys).toEqual([
      'configuration',
      'middleware',
      'fetchApi',
      'auth',
      'users',
      'tenants',
      'me',
    ]);
    keys.forEach((k) => {
      const props = Object.getOwnPropertyNames(
        // @ts-expect-error testing
        Object.getPrototypeOf(nile[k])
      );
      if (k === 'auth') {
        expect(props).toEqual(['constructor', 'signin']);
      }
      if (k === 'users') {
        expect(props).toEqual([
          'constructor',
          'createTenantUser',
          'createUser',
          'listTenantUsers',
          'listUsers',
          'updateUser',
        ]);
      }
    });
  });
});
