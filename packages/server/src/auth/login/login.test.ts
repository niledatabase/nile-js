import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = { workspace: 'workspace', database: 'database' };
describe('login', () => {
  it('sets a cookie at login', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch({
      token: { jwt: 'adfasdfdsa' },
      tenants: {
        values: () => {
          return {
            next: () => ({
              value: 'adfdsafdsf',
            }),
          };
        },
      },
    });
    const _config = new Config(config);
    const { login } = new Auth(_config);
    const params = { email: 'email', password: 'password' };
    const resp = await login(params);
    const headers = new Headers(resp.headers);
    const cookie = headers.get('set-cookie');
    expect(cookie).toEqual(
      'token=adfasdfdsa; path=/; samesite=lax; httponly;, tenantId=adfdsafdsf; path=/; httponly;'
    );
  });

  it('goes to the right url', () => {
    const _config = new Config(config);
    const auth = new Auth(_config);
    expect(auth.loginUrl).toEqual('/databases/database/users/login');
  });
});
