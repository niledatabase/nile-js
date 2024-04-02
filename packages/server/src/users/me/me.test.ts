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
describe('me', () => {
  it('does a get', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { me } = new Users(_config);

    const res = await me();
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/users/me'
    );
  });
});
