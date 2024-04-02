import { Config } from '../../utils/Config';
import { FakeResponse, _fetch, FakeRequest } from '../../../test/fetch.mock';
import Users from '..';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  databaseId: 'databaseId',
  user: 'username',
  password: 'password',
};
describe('updateUser', () => {
  it('issues a put against provided user id', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { updateUser } = new Users(_config);

    const userId = '12345';
    const params = { email: 'email', preferredName: 'Inigo Montoya' };

    const res = await updateUser(userId, params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/users/12345'
    );
    //@ts-expect-error - test
    expect(res.payload.path.method).toEqual('PUT');
  });
});
