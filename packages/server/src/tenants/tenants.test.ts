import { Config } from '../utils/Config';

import Tenants from '.';

const baseConfig = [
  'api',
  'createTenant',
  'getTenant',
  'db',
  'headers',
  'deleteTenant',
  'debug',
  'logger',
  'databaseId',
  'databaseName',
  'user',
  'updateTenant',
  'listTenants',
  'configure',
  'password',
];
const apiConfig = [
  'basePath',
  'callbackUrl',
  'origin',
  'cookieKey',
  'routePrefix',
  'routes',
  'headers',
  'secureCookies',
];
const config = {
  databaseId: 'databaseId',
  user: 'username',
  password: 'password',
};
describe('tenants', () => {
  it('has expected methods', () => {
    const methods = new Tenants(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});
