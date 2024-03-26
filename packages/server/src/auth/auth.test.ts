import { Config } from '../utils/Config';

import Auth from './';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createProvider',
  'databaseId',
  'db',
  'getSSOCallbackUrl',
  'listProviders',
  'listTenantProviders',
  'login',
  'loginSSO',
  'loginSSOUrl',
  'signUp',
  'updateProvider',
  'username',
  'password',
];
it('has expected methods', () => {
  const auth = new Auth(
    new Config({
      databaseId: 'databaseId',
      username: 'username',
      password: 'password',
    })
  );
  expect(Object.keys(auth).sort()).toEqual(baseConfig.sort());
});
