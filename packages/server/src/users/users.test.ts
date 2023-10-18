import { Config } from '../utils/Config';

import Users from '.';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createTenantUser',
  'database',
  'db',
  'listTenantUsers',
  'me',
  'workspace',
];
const config = {
  workspace: 'workspace',
  database: 'database',
  tenantId: 'tenant',
};
describe('users', () => {
  it('has expected methods', () => {
    const methods = new Users(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
  });
});
