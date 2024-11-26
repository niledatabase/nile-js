import { Config } from '../utils/Config';

import Tenants from '.';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createTenant',
  'getTenant',
  'db',
  'headers',
  'deleteTenant',
  'routePrefix',
  'routes',
  'debug',
  'logger',
  'databaseId',
  'databaseName',
  'user',
  'updateTenant',
  'secureCookies',
  'listTenants',
  'configure',
  'password',
];
const config = {
  databaseId: 'databaseId',
  user: 'username',
  password: 'password',
};
describe('users', () => {
  it('has expected methods', () => {
    const methods = new Tenants(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
  });
});
