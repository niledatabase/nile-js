import { Config } from '../utils/Config';

import SignUp from './signUp';

jest.mock('../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

describe('signUp', () => {
  it('goes to the right url', () => {
    const login = new SignUp(
      new Config({ workspace: 'workspace', database: 'database' })
    );
    expect(login.url).toEqual('/workspaces/workspace/databases/database/users');
  });
});
