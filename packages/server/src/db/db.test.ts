import NileDB from './index';

const properties = ['connections'];
describe('db', () => {
  it('has expected properties', () => {
    const db = new NileDB({
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: 'password',
      debug: false,
      db: {
        port: 4433,
      },
      api: {
        token: 'blah',
      },
      tenantId: null,
      userId: null,
    });
    expect(Object.keys(db).sort()).toEqual(properties.sort());
  });
});
