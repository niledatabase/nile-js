import { Config } from '../utils/Config';

import Users from '.';

const baseConfig = [
  'api',
  'createUser',
  'databaseId',
  'createTenantUser',
  'db',
  'headers',
  'linkUser',
  'listUsers',
  'me',
  'databaseName',
  'debug',
  'configure',
  'updateUser',
  'logger',
  'unlinkUser',
  'updateMe',
  'user',
  'password',
];
const apiConfig = [
  'basePath',
  'origin',
  'callbackUrl',
  'cookieKey',
  'routePrefix',
  'routes',
  'headers',
  'secureCookies',
];
const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
  user: 'username',
  password: 'password',
};
describe('users', () => {
  it('has expected methods', () => {
    const methods = new Users(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});
