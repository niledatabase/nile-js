import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Users from '..';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
  user: 'username',
  password: 'password',
};
describe('createUser', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { createTenantUser } = new Users(_config);

    const params = { email: 'email', password: 'password' };

    const res = await createTenantUser(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/tenants/tenant/users'
    );
  });
});
