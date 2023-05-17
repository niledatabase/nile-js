import { Config } from '../../utils/Config';
import { FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

describe('signUp', () => {
  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    global.fetch = _fetch();
    const { signUp } = new Auth(
      new Config({ workspace: 'workspace', database: 'database' })
    );

    const params = {
      body: { email: 'email', password: 'password' },
    } as unknown as Request;
    const res = await signUp(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/users'
    );
  });
});
