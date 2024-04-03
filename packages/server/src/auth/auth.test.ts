import { Config } from '../utils/Config';

import Auth from './';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createProvider',
  'databaseId',
  'databaseName',
  'db',
  'debug',
  'getSSOCallbackUrl',
  'listProviders',
  'listTenantProviders',
  'login',
  'loginSSO',
  'loginSSOUrl',
  'signUp',
  'updateProvider',
  'configure',
  'user',
  'password',
];
it('has expected methods', () => {
  const auth = new Auth(
    new Config({
      databaseId: 'databaseId',
      user: 'username',
      password: 'password',
    })
  );
  expect(Object.keys(auth).sort()).toEqual(baseConfig.sort());
});
