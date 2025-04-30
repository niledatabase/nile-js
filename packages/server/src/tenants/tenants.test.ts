import { Config } from '../utils/Config';
import { apiConfig, baseConfig } from '../../test/configKeys';

import Tenants from '.';

const tenants = [
  'createTenant',
  'getTenant',
  'deleteTenant',
  'updateTenant',
  'listTenants',
];
describe('tenants', () => {
  it('has expected methods', () => {
    const methods = new Tenants(new Config());
    expect(
      Object.keys(methods)
        .filter((m) => !baseConfig.includes(m))
        .sort()
    ).toEqual(tenants.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});
