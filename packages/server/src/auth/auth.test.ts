import { Config } from '../utils/Config';

import Auth from './';

const baseConfig = [
  '_tenantId',
  'api',
  'database',
  'workspace',
  'db',
  'getProvider',
  'login',
  'signUp',
  'updateProvider',
];
it('has expected methods', () => {
  const auth = new Auth(
    new Config({ workspace: 'workspace', database: 'database' })
  );
  expect(Object.keys(auth).sort()).toEqual(baseConfig.sort());
});
