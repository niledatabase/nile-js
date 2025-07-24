import { Config } from '../utils/Config';

import NileDB from './index';

const properties = [
  'connections',
  'clear',
  'cleared',
  'getConnection',
  'poolWatcher',
  'poolWatcherFn',
];
describe('db', () => {
  it('has expected properties', () => {
    const db = new NileDB(
      new Config({
        databaseId: 'databaseId',
        databaseName: 'databaseName',
        user: 'username',
        password: 'password',
        debug: false,
        db: {
          port: 4433,
        },
        tenantId: null,
        userId: null,
      })
    );
    expect(Object.keys(db).sort()).toEqual(properties.sort());
  });
});
