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
  'getSession',
  'user',
];
const apiConfig = [
  '_token',
  'basePath',
  'callbackUrl',
  'cookieKey',
  'routePrefix',
  'routes',
  'secureCookies',
];
const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
  user: 'username',
  password: 'password',
};
describe('auth', () => {
  it('has expected methods', () => {
    const methods = new Auth(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});
