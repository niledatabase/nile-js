import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase from './NileInstance';

describe('nile instance', () => {
  it('evitcs pools', (done) => {
    const config = new Config({
      databaseId: 'databaseId',
      user: 'username',
      password: 'password',
      db: {
        idleTimeoutMillis: 1,
      },
    });
    new NileDatabase(config.db, config.logger, 'someId');
    watchEvictPool((id) => {
      expect(id).toEqual('someId');
      done();
    });
  });
});
