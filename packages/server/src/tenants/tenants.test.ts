import { Config } from '../utils/Config';

import Tenants from '.';

const baseConfig = [
  '_tenantId',
  '_userId',
  'api',
  'createTenant',
  'getTenant',
  'db',
  'databaseId',
];
const config = {
  databaseId: 'databaseId',
};
describe('users', () => {
  it('has expected methods', () => {
    const methods = new Tenants(new Config(config));
    expect(Object.keys(methods).sort()).toEqual(baseConfig.sort());
  });
});
