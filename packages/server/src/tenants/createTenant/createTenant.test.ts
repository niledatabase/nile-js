import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Tenants from '..';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  databaseId: 'databaseId',
  tenantId: 'tenant',
};
describe('createUser', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { createTenant } = new Tenants(_config);

    const params = { name: 'tenant1' };

    const res = await createTenant(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/tenants'
    );
  });
});
