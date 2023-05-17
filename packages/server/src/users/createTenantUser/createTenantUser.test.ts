import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Users from '..';

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
    const { createTenantUser } = new Users(new Config(config));

    const headers = new Headers();
    headers.set('referer', 'http://localhost:8080?tenantId=tenant');
    const params = {
      body: { email: 'email', password: 'password' },
      headers,
    } as unknown as Request;
    const res = await createTenantUser(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/tenants/tenant/users'
    );
  });
});
