import NileDB from './index';

const properties = ['connections'];
describe('db', () => {
  it('has expected properties', () => {
    const db = new NileDB({
      workspace: 'workspace',
      database: 'database',
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
