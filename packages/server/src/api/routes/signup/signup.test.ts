import { Config } from '../../../utils/Config';
import fetch from '../../utils/request';

import route from '.';

const utilRequest = fetch as jest.Mock;

jest.mock('../../utils/request', () => jest.fn());
jest.mock('../../utils/auth', () => () => ({
  id: 'something',
}));

describe('signup route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should post sign up', async () => {
    const _res = new Request('http://thenile.dev', {
      method: 'POST',
    });
    await route(
      _res,
      new Config({
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/signup',
      expect.objectContaining({ method: 'POST' }),
      expect.objectContaining({})
    );
  });
});
