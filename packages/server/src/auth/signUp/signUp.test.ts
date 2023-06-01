import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

describe('signUp', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const { signUp } = new Auth(
      new Config({ workspace: 'workspace', database: 'database' })
    );

    const res = await signUp({ email: 'email', password: 'password' });
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/users'
    );
  });
});
