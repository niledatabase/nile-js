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
];
it('has expected methods', () => {
  const auth = new Auth(new Config({ databaseId: 'databaseId' }));
  expect(Object.keys(auth).sort()).toEqual(baseConfig.sort());
});
