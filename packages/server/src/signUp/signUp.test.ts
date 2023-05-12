import { Config } from '../utils/Config';
import { FakeResponse, _fetch } from '../../test/fetch.mock';

import SignUp from './signUp';

jest.mock('../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const baseConfig = [
  'basePath',
  'database',
  'tenantId',
  'workspace',
  'cookieKey',
  'url',
];
describe('signUp', () => {
  it('has expected methods', () => {
    const signup = new SignUp(
      new Config({ workspace: 'workspace', database: 'database' })
    );
    expect(Object.keys(signup).sort()).toEqual([...baseConfig, 'post'].sort());
  });

  it('does a post', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    global.fetch = _fetch();
    const signup = new SignUp(
      new Config({ workspace: 'workspace', database: 'database' })
    );

    const params = {
      body: { email: 'email', password: 'password' },
    } as unknown as Request;
    const res = await signup.post(params);
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/users'
    );
  });
});
