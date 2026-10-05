import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase from './NileInstance';

describe('nile instance', () => {
  it('evitcs pools', (done) => {
    const config = new Config({
      apiUrl: 'https://api.example.test',
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: 'password',
      db: {
        idleTimeoutMillis: 1,
      },
    });
    const instance = new NileDatabase(config.db, config.logger, 'someId');
    watchEvictPool((id) => {
      expect(id).toEqual('someId');
      done();
    }, instance);
  });
});
