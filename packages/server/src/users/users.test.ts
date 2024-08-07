import { Config } from '../utils/Config';

import Users from '.';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createTenantUser',
  'databaseId',
  'db',
  'listTenantUsers',
  'listUsers',
  'me',
  'databaseName',
  'debug',
  'configure',
  'updateUser',
  'user',
  'password',
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
  });
});
