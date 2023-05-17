import { Config } from '../../utils/Config';
import { FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

describe('login', () => {
  it('sets a cookie at login', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    global.fetch = _fetch({ jwt: 'adfasdfdsa' });
    const { login } = new Auth(
      new Config({ workspace: 'workspace', database: 'database' })
    );
    const params = {
      body: { email: 'email', password: 'password' },
    } as unknown as Request;
    const resp = (await login(params)) as unknown as FakeResponse;
    const headers = new Headers(resp.headers);
    const cookie = headers.get('set-cookie');
    expect(cookie).toEqual('token=adfasdfdsa; path=/; samesite=lax; httponly;');
  });

  it('goes to the right url', () => {
    const auth = new Auth(
      new Config({ workspace: 'workspace', database: 'database' })
    );
    expect(auth.loginUrl).toEqual(
      '/workspaces/workspace/databases/database/users/login'
    );
  });
});