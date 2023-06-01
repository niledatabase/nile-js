import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Tenants from '..';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  workspace: 'workspace',
  database: 'database',
  tenantId: 'tenant',
};
describe('createUser', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const { createTenant } = new Tenants(new Config(config));

    const params = { name: 'tenant1' };

    const res = await createTenant(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/tenants'
    );
  });
});
