import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));
const config = {
  databaseId: 'databaseId',
  user: 'username',
  password: 'password',
};

describe('signUp', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { signUp } = new Auth(new Config(_config));

    const res = await signUp({ email: 'email', password: 'password' });
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/users'
    );
  });
});
