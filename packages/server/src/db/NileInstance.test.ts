import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase from './NileInstance';

describe('nile instance', () => {
  it('evitcs pools', (done) => {
    const config = new Config({
      databaseId: 'databaseId',
      db: {
        pool: {
          idleTimeoutMillis: 1,
        },
      },
    });
    new NileDatabase(config, 'someId');
    watchEvictPool((id) => {
      expect(id).toEqual('someId');
      done();
    });
  });
});
