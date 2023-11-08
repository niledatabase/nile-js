import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase from './NileInstance';

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
  it('evitcs pools', (done) => {
    const config = new Config({
      database: 'database',
      workspace: 'workspace',
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
