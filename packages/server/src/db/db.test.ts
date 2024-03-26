import NileDB from './index';

const properties = ['connections'];
describe('db', () => {
  it('has expected properties', () => {
    const db = new NileDB({
      databaseId: 'databaseId',
      username: 'username',
      password: 'password',
      db: {
        connection: { port: 4433 },
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
