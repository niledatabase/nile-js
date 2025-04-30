import { Config } from '../utils/Config';
import { apiConfig, baseConfig } from '../../test/configKeys';

import Users from '.';

const users = [
  'createUser',
  'createTenantUser',
  'linkUser',
  'listUsers',
  'me',
  'updateUser',
  'unlinkUser',
  'updateMe',
];

describe('users', () => {
  it('has expected methods', () => {
    const methods = new Users(new Config());
    expect(
      Object.keys(methods)
        .filter((m) => !baseConfig.includes(m))
        .sort()
    ).toEqual(users.sort());
    expect(Object.keys(methods.api).sort()).toEqual(apiConfig.sort());
  });
});
