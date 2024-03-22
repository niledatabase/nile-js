import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Tenants from '..';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  workspace: 'workspace',
  database: 'database',
  tenantId: '123',
};
describe('getTenant', () => {
  it('does a get', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { getTenant } = new Tenants(_config);

    const res = await getTenant();
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/database/tenants/123'
    );
  });
});
