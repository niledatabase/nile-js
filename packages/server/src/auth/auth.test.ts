import { Config } from '../utils/Config';

import Auth from '.';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'configure',
  'databaseId',
  'databaseName',
  'db',
  'debug',
  'headers',
  'logger',
  'password',
  'routePrefix',
  'routes',
  'session',
  'user',
];
const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
  user: 'username',
  password: 'password',
};
describe('users', () => {
  it('has expected methods', () => {
    const methods = new Auth(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
  });
});
